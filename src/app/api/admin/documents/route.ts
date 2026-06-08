import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";

declare global {
  var io: any;
}

const SUPER_ADMIN_CLERK_IDS = [
  "user_38qCNW1RIEGrQ6rORph6s2348NX",
  "user_3B9OSNbtBdz7tP5pghbHX2FvQDp",
];

// ✅ Notify all members of admin activity
async function broadcastAdminNotification(
  title: string,
  message: string,
  type: 'SYSTEM' | 'INVESTMENT' | 'PAYMENT' | 'KYC' = 'SYSTEM'
) {
  try {
    // Create system notification (userId: null means it's for everyone)
    const notification = await prisma.notification.create({
      data: {
        userId: null,
        title,
        message,
        type,
      },
    });

    // Emit real-time notification to all connected clients
    if (globalThis.io) {
      globalThis.io.emit('notification:broadcast', notification);
    }

    return notification;
  } catch (error) {
    console.error('[BROADCAST NOTIFICATION ERROR]', error);
  }
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

      fileName = file.name;

      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "documents",
              resource_type: "raw",
              use_filename: true,
              unique_filename: false,
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      // ✅ CRITICAL FIX
      fileUrl = uploadResult.secure_url.replace(
        "/upload/",
        `/upload/fl_attachment:${encodeURIComponent(fileName)}/`
      );
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

    // ✅ Broadcast notification if document is published
    if (isPublished) {
      await broadcastAdminNotification(
        '📄 New Document Published',
        `Admin ${admin.fullName || admin.email} has published a new document: "${title}". Check the Documents Hub to view it.`,
        'SYSTEM'
      );
    }

    return NextResponse.json(document);
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

  // ✅ Broadcast notification if document is being published
  if (isPublished && !previousDoc?.isPublished) {
    await broadcastAdminNotification(
      '📄 New Document Published',
      `Admin ${admin.fullName || admin.email} has published: "${title}". Check the Documents Hub to view it.`,
      'SYSTEM'
    );
  }

  return NextResponse.json(updated);
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