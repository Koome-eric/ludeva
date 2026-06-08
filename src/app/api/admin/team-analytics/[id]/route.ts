import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

declare global {
  var io: any;
}

// ✅ Notify all members of admin activity
async function broadcastAdminNotification(
  title: string,
  message: string,
  type: 'SYSTEM' | 'INVESTMENT' | 'PAYMENT' | 'KYC' = 'SYSTEM'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: null,
        title,
        message,
        type,
      },
    });

    if (globalThis.io) {
      globalThis.io.emit('notification:broadcast', notification);
    }

    return notification;
  } catch (error) {
    console.error('[BROADCAST NOTIFICATION ERROR]', error);
  }
}

// DELETE /api/admin/team-analytics/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();

    const deletedRecord = await prisma.teamAnalytics.findUnique({
      where: { id: params.id },
    });

    await prisma.teamAnalytics.delete({ where: { id: params.id } });

    // ✅ Notify all members when analytics are removed
    if (deletedRecord) {
      await broadcastAdminNotification(
        '🗑️ Analytics Removed',
        `Admin ${admin.fullName || admin.email} has removed the analytics: "${deletedRecord.label}".`,
        'SYSTEM'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEAM ANALYTICS DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}