import { requireUserApi } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireUserApi();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Shared inbox — every admin sees every member conversation. Rooms are
    // still auto-assigned an adminId when created (for the "who started it"
    // record), but visibility and replies are not restricted to that admin;
    // otherwise a member becomes invisible (and unsearchable) to every admin
    // except the one that happened to get auto-assigned.
    const rooms = await prisma.chatRoom.findMany({
      include: {
        member: {
          select: { id: true, fullName: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // last message preview
        },
        _count: {
          select: {
            messages: { where: { read: false, senderId: { not: user.id } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('[ADMIN CHATS ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}