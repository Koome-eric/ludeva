import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { uploadBufferToR2, buildObjectKey, isR2Configured, deleteFromR2, keyFromR2Url } from "@/lib/r2";
import { notifyAllMembers } from "@/lib/notifications";

declare global {
  var io: any;
}

const SUPER_ADMIN_CLERK_IDS = [
  "user_38qCNW1RIEGrQ6rORph6s2348NX",
  "user_3B9OSNbtBdz7tP5pghbHX2FvQDp",
];

// Documents Hub is member-facing, so publish/removal alerts go to members
// only (tagged audience: MEMBER) — not into every admin's own feed too.
async function broadcastAdminNotification(
  title: string,
  message: string,
  type: 'SYSTEM' | 'INVESTMENT' | 'PAYMENT' | 'KYC' = 'SYSTEM'
) {
  return notifyAllMembers(title, message, type);
}

async function getAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? "",
        fullName: `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`,
        role: SUPER_ADMIN_CLERK_IDS.includes(userId) ? "ADMIN" : "MEMBER",
      },
    });
  }

  if (SUPER_ADMIN_CLERK_IDS.includes(userId) && dbUser.role !== "ADMIN") {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "ADMIN" },
    });
  }

  if (dbUser.role !== "ADMIN") return null;

  return dbUser;
}

//
// ======================= GET =======================
//
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return NextResponse.json({
    data: documents,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

//
// ======================= POST (FIXED CORE)
//
export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as "FILE" | "CONTENT";
    const content = formData.get("content") as string;
    const isPublishedRaw = formData.get("isPublished");
    const isPublished = isPublishedRaw === null ? true : isPublishedRaw === "true";

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (type === "FILE") {
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "File required" }, { status: 400 });
      }

      if (!isR2Configured()) {
        console.error('[R2 UPLOAD] Cloudflare R2 is not configured — check env vars.');
        return NextResponse.json({ error: 'File storage is not configured' }, { status: 500 });
      }

      fileName = file.name;

      const buffer = Buffer.from(await file.arrayBuffer());
      const key = buildObjectKey("documents", file.name.replace(/\.[^.]+$/, ""), file.name);

      try {
        // Store the plain public URL — Content-Disposition is set by the download proxy route
        fileUrl = await uploadBufferToR2(buffer, key, file.type || "application/octet-stream");
      } catch (uploadErr) {
        console.error('[R2 UPLOAD] failed', uploadErr);
        return NextResponse.json({ error: 'File upload failed' }, { status: 502 });
      }
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        type,
        content: type === "CONTENT" ? content : null,
        fileUrl,
        fileName,
        isPublished,
        createdById: admin.id,
      },
    });

    // For CONTENT (text-composed) documents, also store a plain-text copy in
    // R2 so admin-created documents are downloadable the same way uploaded
    // files are — not just readable in-app.
    let finalDocument = document;
    if (type === "CONTENT" && content && isR2Configured()) {
      try {
        const key = `documents/content/${document.id}.txt`;
        const contentUrl = await uploadBufferToR2(
          Buffer.from(content, "utf-8"),
          key,
          "text/plain; charset=utf-8"
        );
        finalDocument = await prisma.document.update({
          where: { id: document.id },
          data: { fileUrl: contentUrl, fileName: `${title || "document"}.txt` },
        });
      } catch (uploadErr) {
        // Non-fatal — the document and its content are already saved in the
        // database and readable in-app; only the R2 backup copy failed.
        console.error('[R2 UPLOAD] content backup failed', uploadErr);
      }
    }

    // ✅ Broadcast notification if document is published
    if (isPublished) {
      await broadcastAdminNotification(
        '📄 New Document Published',
        `Admin ${admin.fullName || admin.email} has published a new document: "${title}". Check the Documents Hub to view it.`,
        'SYSTEM'
      );
    }

    return NextResponse.json(finalDocument);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

//
// ======================= PUT =======================
//
export async function PUT(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, description, content, isPublished } = await req.json();

  // Get previous state to detect publish action
  const previousDoc = await prisma.document.findUnique({ where: { id } });

  const updated = await prisma.document.update({
    where: { id },
    data: {
      title,
      description,
      content,
      ...(isPublished !== undefined ? { isPublished } : {}),
    },
  });

  // Keep the R2 text-file backup of CONTENT documents in sync with edits.
  let finalUpdated = updated;
  if (previousDoc?.type === "CONTENT" && content && isR2Configured()) {
    try {
      const key = `documents/content/${id}.txt`;
      const contentUrl = await uploadBufferToR2(
        Buffer.from(content, "utf-8"),
        key,
        "text/plain; charset=utf-8"
      );
      finalUpdated = await prisma.document.update({
        where: { id },
        data: { fileUrl: contentUrl, fileName: `${title || "document"}.txt` },
      });
    } catch (uploadErr) {
      console.error('[R2 UPLOAD] content backup update failed', uploadErr);
    }
  }

  // ✅ Broadcast notification if document is being published
  if (isPublished && !previousDoc?.isPublished) {
    await broadcastAdminNotification(
      '📄 New Document Published',
      `Admin ${admin.fullName || admin.email} has published: "${title}". Check the Documents Hub to view it.`,
      'SYSTEM'
    );
  }

  return NextResponse.json(finalUpdated);
}

//
// ======================= DELETE =======================
//
export async function DELETE(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const deletedDoc = await prisma.document.findUnique({ where: { id } });

  await prisma.document.delete({ where: { id } });

  // Clean up the corresponding object in R2, if any, so storage doesn't
  // accumulate orphaned files.
  if (deletedDoc?.fileUrl) {
    const key = keyFromR2Url(deletedDoc.fileUrl);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch (err) {
        console.error('[R2 DELETE] failed to remove object for document', id, err);
      }
    }
  }

  // ✅ Notify of deletion if document was published
  if (deletedDoc?.isPublished) {
    await broadcastAdminNotification(
      '🗑️ Document Removed',
      `Admin ${admin.fullName || admin.email} has removed the document: "${deletedDoc.title}".`,
      'SYSTEM'
    );
  }

  return NextResponse.json({ success: true });
}