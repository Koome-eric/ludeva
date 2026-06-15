'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Approve a user's KYC and set the submission date if not already set
 */
export async function approveKyc(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: 'APPROVED',
      kycSubmittedAt: { set: new Date() }, // always record submission date
    },
  });

  revalidatePath('/admin/investors/kyc');
  return { success: true, user };
}

/**
 * Reject a user's KYC and set the submission date if not already set
 */
export async function rejectKyc(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: 'REJECTED',
      kycSubmittedAt: { set: new Date() }, // record submission date
    },
  });

  revalidatePath('/admin/investors/kyc');
  return { success: true, user };
}

/**
 * Permanently delete a member (MEMBER role user) from the database
 */
export async function deleteMember(userId: string) {
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      OR: [
        { memberId: userId },
        { adminId: userId },
      ],
    },
    select: { id: true },
  });

  const roomIds = chatRooms.map((room) => room.id);

  await prisma.$transaction([
    prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          ...(roomIds.length > 0 ? [{ roomId: { in: roomIds } }] : []),
        ],
      },
    }),
    prisma.chatRoom.deleteMany({
      where: {
        OR: [
          { memberId: userId },
          { adminId: userId },
        ],
      },
    }),
    prisma.payment.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.investment.deleteMany({ where: { userId } }),
    prisma.document.deleteMany({ where: { createdById: userId } }),
    prisma.teamAnalytics.deleteMany({ where: { uploadedById: userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId, role: 'MEMBER' } }),
  ]);

  revalidatePath('/admin/investors/kyc');
  return { success: true };
}