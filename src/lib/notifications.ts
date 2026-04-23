import { prisma } from "@/lib/prisma";

type NotificationType = "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC";

// ✅ Hard-coded super admin
const SUPER_ADMIN_CLERK_ID = "user_38qCNW1RIEGrQ6rORph6s2348NX";

// ------------------ Notify All Members ------------------
export async function notifyAllMembers(
  title: string,
  message: string,
  type: NotificationType = "SYSTEM"
) {
  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true },
  });

  if (!members.length) return;

  const notifications = members.map(member => ({
    userId: member.id,
    title,
    message,
    type,
  }));

  await prisma.notification.createMany({ data: notifications });

  // Emit via socket
  if (globalThis.io) {
    notifications.forEach(n =>
      globalThis.io.to(`member:${n.userId}`).emit("member:notification:new", n)
    );
  }
}

// ------------------ Notify Single User ------------------
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "SYSTEM"
) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type },
  });

  if (globalThis.io) {
    globalThis.io.to(`user:${userId}`).emit("user:notification:new", notification);
  }
}

// ------------------ Notify Super Admin ------------------
export async function notifyAdmin(
  title: string,
  message: string,
  type: NotificationType = "SYSTEM"
) {
  try {
    const superAdmin = await prisma.user.findUnique({
      where: { clerkId: SUPER_ADMIN_CLERK_ID },
      select: { id: true },
    });
    if (!superAdmin) return;

    // ✅ Store notification in DB
    const notification = await prisma.notification.create({
      data: { userId: superAdmin.id, title, message, type },
    });

    // ✅ Emit live via socket
    if (globalThis.io) {
      globalThis.io.to(`admin:${superAdmin.id}`).emit("admin:notification:new", notification);
    }

    return notification;
  } catch (err) {
    console.error("notifyAdmin error:", err);
  }
}