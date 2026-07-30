import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { notifyAllAdmins } from '@/lib/notifications';

declare global {
  var io: any;
}

// Internal/admin-only feature — alerts go to the rest of the admin team, not
// to member accounts (there's no member-facing Team Analytics page).
async function broadcastAdminNotification(
  title: string,
  message: string,
  type: 'SYSTEM' | 'INVESTMENT' | 'PAYMENT' | 'KYC' = 'SYSTEM',
  excludeUserId?: string
) {
  return notifyAllAdmins(title, message, type, { excludeUserId });
}

// DELETE /api/admin/team-analytics/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();

    const deletedRecord = await prisma.teamAnalytics.findUnique({
      where: { id: params.id },
    });

    await prisma.teamAnalytics.delete({ where: { id: params.id } });

    // Notify the rest of the admin team when analytics are removed
    if (deletedRecord) {
      await broadcastAdminNotification(
        '🗑️ Analytics Removed',
        `Admin ${admin.fullName || admin.email} has removed the analytics: "${deletedRecord.label}".`,
        'SYSTEM',
        admin.id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEAM ANALYTICS DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
