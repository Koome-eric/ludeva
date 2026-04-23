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