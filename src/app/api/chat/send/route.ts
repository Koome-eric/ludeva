import { prisma } from '@/lib/prisma';
import { requireUserApi } from '@/lib/auth-guard';
import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const user = await requireUserApi();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { roomId, content } = body;

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ error: 'roomId and content are required' }, { status: 400 });
    }

    // Verify the user belongs to this room (member or admin)
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [{ memberId: user.id }, { adminId: user.id }],
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found or access denied' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: user.id,
        content: content.trim(),
      },
    });

    // Mark other party's messages as read when replying
    await prisma.message.updateMany({
      where: {
        roomId,
        senderId: { not: user.id },
        read: false,
      },
      data: { read: true },
    });

    // Trigger real-time event
    await pusherServer.trigger(`chat-${roomId}`, 'new-message', message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('[CHAT SEND ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}