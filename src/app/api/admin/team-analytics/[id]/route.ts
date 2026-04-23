import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// DELETE /api/admin/team-analytics/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.teamAnalytics.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEAM ANALYTICS DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}