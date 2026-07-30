// src/app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notifyAllAdmins } from "@/lib/notifications";

declare global {
  var io: any;
}

// ---------------- GET ADMIN NOTIFICATIONS ----------------
// Every admin gets their own admin-relevant feed — not just one hardcoded
// super-admin id. Scoped to notifications addressed to this admin
// specifically, plus any ADMIN-audience broadcast (e.g. internal ops
// announcements). MEMBER-audience broadcasts never show up here.
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: admin.id },
          { userId: null, audience: { in: ["ADMIN", "ALL"] } },
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

// ---------------- SEND LIVE ADMIN NOTIFICATION (all admins) ----------------
export async function notifyAdminLive(
  title: string,
  message: string,
  type: "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC" = "SYSTEM"
) {
  return notifyAllAdmins(title, message, type);
}
