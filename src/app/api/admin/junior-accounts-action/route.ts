'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notifyUser } from '@/lib/notifications';

/**
 * Approve a Junior Account application. This doesn't move money — it
 * unblocks the guardian from investing into the active JUNIOR product on
 * the child's behalf (see the JUNIOR gate in /api/investments).
 */
export async function approveJuniorApplication(applicationId: string, note?: string) {
  const application = await prisma.juniorAccountApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error('Application not found');
  if (application.status !== 'PENDING_REVIEW') throw new Error('This application has already been decided');

  const updated = await prisma.juniorAccountApplication.update({
    where: { id: applicationId },
    data: {
      status: 'APPROVED',
      reviewNotes: note?.trim() || undefined,
      reviewedAt: new Date(),
    },
  });

  await notifyUser(
    application.guardianId,
    '✅ Junior Account Approved',
    `The Ludeva Junior Account for ${application.childFullName} has been approved. You can now fund it from Accounts.`,
    'KYC'
  );

  revalidatePath('/admin/investors/junior-accounts');
  return { success: true, application: updated };
}

/**
 * Reject a Junior Account application. The guardian can correct the
 * documents/details and re-apply.
 */
export async function rejectJuniorApplication(applicationId: string, note?: string) {
  const application = await prisma.juniorAccountApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error('Application not found');
  if (application.status !== 'PENDING_REVIEW') throw new Error('This application has already been decided');

  const updated = await prisma.juniorAccountApplication.update({
    where: { id: applicationId },
    data: {
      status: 'REJECTED',
      reviewNotes: note?.trim() || undefined,
      reviewedAt: new Date(),
    },
  });

  await notifyUser(
    application.guardianId,
    '⚠️ Junior Account Application Not Approved',
    `The Junior Account application for ${application.childFullName} was not approved.${note ? ` Reason: ${note}` : ' Please review the documents and re-apply, or contact support.'}`,
    'KYC'
  );

  revalidatePath('/admin/investors/junior-accounts');
  return { success: true, application: updated };
}
