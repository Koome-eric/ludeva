// src/app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

declare global {
  var io: any;
}

const SUPER_ADMIN_CLERK_ID = "user_38qCNW1RIEGrQ6rORph6s2348NX";

// ---------------- GET ADMIN NOTIFICATIONS ----------------
export async function GET() {
  try {
    const admin = await prisma.user.findUnique({
      where: { clerkId: SUPER_ADMIN_CLERK_ID },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Super admin not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: admin.id },
          { userId: null },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Admin notifications fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// ---------------- MARK AS READ ----------------
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Notification ID missing" }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Admin notification read error:", err);
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
  }
}

// ---------------- SEND LIVE ADMIN NOTIFICATION ----------------
export async function notifyAdminLive(
  title: string,
  message: string,
  type: "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC" = "SYSTEM"
) {
  try {
    const admin = await prisma.user.findUnique({
      where: { clerkId: SUPER_ADMIN_CLERK_ID },
      select: { id: true },
    });

    if (!admin) return;

    const notification = await prisma.notification.create({
      data: {
        userId: admin.id,
        title,
        message,
        type,
      },
    });

    if (globalThis.io) {
      globalThis.io
        .to(`admin:${admin.id}`)
        .emit("notification:new", notification);
    }

    return notification;
  } catch (err) {
    console.error("notifyAdminLive error:", err);
  }
}