import { prisma } from "@/lib/prisma";

type NotificationType = "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC";

// ------------------ Notify All Members ------------------
// Creates one notification row per member (not a single userId:null row) so
// read/unread state is tracked per member individually. Tagged audience:
// MEMBER so it never leaks into an admin's own notification feed.
export async function notifyAllMembers(
  title: string,
  message: string,
  type: NotificationType = "SYSTEM",
  opts: { excludeUserId?: string } = {}
) {
  const members = await prisma.user.findMany({
    where: { role: "MEMBER", ...(opts.excludeUserId ? { id: { not: opts.excludeUserId } } : {}) },
    select: { id: true },
  });

  if (!members.length) return;

  const notifications = members.map(member => ({
    userId: member.id,
    title,
    message,
    type,
    audience: "MEMBER" as const,
  }));

  await prisma.notification.createMany({ data: notifications });

  if (globalThis.io) {
    notifications.forEach(n =>
      globalThis.io.to(`user:${n.userId}`).emit("notification:new", n)
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
  const recipient = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      audience: recipient?.role === "ADMIN" ? "ADMIN" : "MEMBER",
    },
  });

  if (globalThis.io) {
    globalThis.io.to(`user:${userId}`).emit("notification:new", notification);
  }

  return notification;
}

// ------------------ Notify ALL Admins ------------------
// Every admin (role: 'ADMIN', which includes auto-upgraded super admins) gets
// their own notification row — not just one hardcoded super-admin id. This is
// the shared "admin inbox" equivalent for alerts: new investments, new KYC
// submissions, new investor sign-ups, deposit requests, etc.
export async function notifyAllAdmins(
  title: string,
  message: string,
  type: NotificationType = "SYSTEM",
  opts: { excludeUserId?: string } = {}
) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", ...(opts.excludeUserId ? { id: { not: opts.excludeUserId } } : {}) },
    select: { id: true },
  });

  if (!admins.length) return;

  // Individual creates (not createMany) so each row gets a real id back —
  // needed for live socket delivery + mark-as-read to work immediately,
  // and the admin list here is small enough that this is cheap.
  const notifications = await Promise.all(
    admins.map(admin =>
      prisma.notification.create({
        data: { userId: admin.id, title, message, type, audience: "ADMIN" },
      })
    )
  );

  if (globalThis.io) {
    notifications.forEach(n =>
      globalThis.io.to(`admin:${n.userId}`).emit("admin:notification:new", n)
    );
  }
}

// Back-compat alias — old call sites used notifyAdmin() expecting the single
// super admin to hear about it. It now correctly reaches every admin.
export const notifyAdmin = notifyAllAdmins;
