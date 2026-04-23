import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

declare global {
  var io: any;
}

/* ---------------- GET MEMBER NOTIFICATIONS ---------------- */

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }, // system notifications
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Member notifications fetch error:", err);

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/* ---------------- MARK AS READ ---------------- */

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID missing" },
        { status: 400 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Member notification read error:", err);

    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

/* ---------------- LIVE MEMBER NOTIFICATION ---------------- */

export async function notifyMemberLive(
  userId: string,
  title: string,
  message: string,
  type: "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC"
) {
  try {
    /* 1️⃣ Save notification */

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    /* 2️⃣ Emit real-time event */

    if (globalThis.io) {
      globalThis.io
        .to(`user:${userId}`)   // ✅ correct room
        .emit("notification:new", notification);
    }

    return notification;
  } catch (err) {
    console.error("notifyMemberLive error:", err);
  }
}