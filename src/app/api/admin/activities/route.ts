// src/app/api/admin/activities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

declare global {
  var io: any; // Socket.IO server instance
}

// ------------------ GET ADMIN ACTIVITIES ------------------
export async function GET() {
  try {
    // Fetch notifications (activities)
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true }, // include user info
    });

    const activityLogs = notifications.map((n) => ({
      id: n.id,
      user: n.user?.fullName || n.user?.email || "Unknown",
      action: n.message,
      date: n.createdAt.toISOString(),
      status: n.type === "SYSTEM" ? "Success" : "Success", // adjust if needed
    }));

    return NextResponse.json(activityLogs);
  } catch (err) {
    console.error("Failed to fetch admin activities:", err);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// ------------------ SEND REAL-TIME ACTIVITY ------------------
export async function notifyAdminActivity(
  userId: string,
  message: string,
  type: "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC"
) {
  try {
    // Create activity notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
      },
      include: { user: true },
    });

    // Emit event via Socket.IO
    if (globalThis.io) {
      const activity = {
        id: notification.id,
        user: notification.user?.fullName || notification.user?.email || "Unknown",
        action: notification.message,
        date: notification.createdAt.toISOString(),
        status: notification.type === "SYSTEM" ? "Success" : "Success",
      };

      // Broadcast to all admins (you can filter room if needed)
      globalThis.io.emit("admin:activity:new", activity);
    }

    return notification;
  } catch (err) {
    console.error("Failed to notify admin activity:", err);
  }
}