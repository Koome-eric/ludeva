import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";

const SUPER_ADMIN_CLERK_IDS = [
  "user_38qCNW1RIEGrQ6rORph6s2348NX",
  "user_3B9OSNbtBdz7tP5pghbHX2FvQDp",
];

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

  if (
    SUPER_ADMIN_CLERK_IDS.includes(userId) &&
    dbUser.role !== "ADMIN"
  ) {
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
// ======================= POST =======================
//
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as "FILE" | "CONTENT";
  const content = formData.get("content") as string;

  let fileUrl: string | null = null;

  if (type === "FILE") {
    const file = formData.get("file") as File;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "documents" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      fileUrl = uploadResult.secure_url;
    }
  }

  const document = await prisma.document.create({
    data: {
      title,
      description,
      type,
      content: type === "CONTENT" ? content : null,
      fileUrl,
      createdById: admin.id,
    },
  });

  return NextResponse.json(document);
}

//
// ======================= PUT =======================
//
export async function PUT(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, description, content } = await req.json();

  const updated = await prisma.document.update({
    where: { id },
    data: { title, description, content },
  });

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

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}