import { requireUserApi } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const user = await requireUserApi();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // Verify admin owns this room
    const room = await prisma.chatRoom.findFirst({
      where: { id: roomId, adminId: user.id },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark member messages as read
    await prisma.message.updateMany({
      where: { roomId, senderId: { not: user.id }, read: false },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[ADMIN MESSAGES ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}