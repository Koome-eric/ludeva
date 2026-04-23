// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

declare global {
  var io: any; // Socket.IO server
}

// ---------------- GET SETTINGS ----------------
export async function GET(req: NextRequest) {
  try {
    // Replace `userId` with authenticated user ID from Clerk/session
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const payment = await prisma.payment.findUnique({ where: { userId } });
    const notifications = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      profile,
      payment,
      notifications,
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// ---------------- SAVE SETTINGS ----------------
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, profile, payment, notifications } = body;

    let updatedProfile = null;
    let updatedPayment = null;
    let updatedNotifications = null;

    // ---------------- PROFILE ----------------
    if (type === "Profile" && profile) {
      updatedProfile = await prisma.profile.upsert({
        where: { userId },
        update: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        create: {
          userId,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
      });
    }

    // ---------------- PAYMENTS ----------------
    if (type === "Payments" && payment) {
      updatedPayment = await prisma.payment.upsert({
        where: { userId },
        update: {
          accountName: payment.accountName,
          bankName: payment.bankName,
          accountNumber: payment.accountNumber,
        },
        create: {
          userId,
          accountName: payment.accountName,
          bankName: payment.bankName,
          accountNumber: payment.accountNumber,
        },
      });
    }

    // ---------------- NOTIFICATIONS ----------------
    if (type === "Notifications" && notifications) {
      updatedNotifications = await prisma.notificationSettings.upsert({
        where: { userId },
        update: {
          newInvestment: notifications.newInvestment,
          payoutCompleted: notifications.payoutCompleted,
          systemAlerts: notifications.systemAlerts,
        },
        create: {
          userId,
          newInvestment: notifications.newInvestment,
          payoutCompleted: notifications.payoutCompleted,
          systemAlerts: notifications.systemAlerts,
        },
      });
    }

    // ---------------- Emit via Socket.IO ----------------
    if (globalThis.io) {
      globalThis.io.emit("settings:update", {
        profile: updatedProfile,
        payment: updatedPayment,
        notifications: updatedNotifications,
      });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      payment: updatedPayment,
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}