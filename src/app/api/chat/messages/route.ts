import { prisma } from '@/lib/prisma';
import { requireUserApi } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

// Polling-based message fetch for a chat room. Used by both the member and
// admin chat clients — they call this on an interval instead of subscribing
// to a realtime channel.
export async function GET(req: Request) {
  try {
    const user = await requireUserApi();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
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

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark the other party's messages as read now that this user has fetched them
    await prisma.message.updateMany({
      where: {
        roomId,
        senderId: { not: user.id },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[CHAT MESSAGES ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
