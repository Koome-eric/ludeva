import { prisma } from './prisma';
import { SUPER_ADMIN_CLERK_IDS } from './auth-guard';

/**
 * Find any available admin to assign to a new chat room.
 * Checks both DB role=ADMIN and hardcoded super admin Clerk IDs.
 */
export async function getAnyAdmin() {
  return prisma.user.findFirst({
    where: {
      OR: [
        { role: 'ADMIN' },
        { clerkId: { in: SUPER_ADMIN_CLERK_IDS } },
      ],
    },
  });
}

/**
 * Get or create a chat room for a member.
 * Auto-assigns the first available admin.
 */
export async function getOrCreateChatRoom(memberId: string) {
  const existing = await prisma.chatRoom.findFirst({
    where: { memberId },
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (existing) return existing;

  const admin = await getAnyAdmin();
  if (!admin) throw new Error('No admin available to handle chat.');

  return prisma.chatRoom.create({
    data: { memberId, adminId: admin.id },
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
      messages: true,
    },
  });
}