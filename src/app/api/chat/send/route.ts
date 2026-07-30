import { prisma } from '@/lib/prisma';
import { requireUserApi } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { notifyUser, notifyAllAdmins } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const user = await requireUserApi();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { roomId, content } = body;

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ error: 'roomId and content are required' }, { status: 400 });
    }

    // Members may only send into their own room. Admins share one inbox, so
    // any admin may reply in any room — not just the one auto-assigned as
    // its adminId.
    const room = await prisma.chatRoom.findFirst({
      where:
        user.role === 'ADMIN'
          ? { id: roomId }
          : { id: roomId, memberId: user.id },
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

    // Surface the message in the recipient's notification bell too, not just
    // inside the chat itself — so it's noticed even when they're not on the
    // Messages screen.
    const senderName = user.fullName || user.email;
    const preview = content.trim().length > 100 ? `${content.trim().slice(0, 100)}…` : content.trim();

    if (user.role === 'ADMIN') {
      await notifyUser(
        room.memberId,
        `💬 New message from ${senderName}`,
        preview,
        'MESSAGE'
      );
    } else {
      await notifyAllAdmins(
        `💬 New message from ${senderName}`,
        preview,
        'MESSAGE'
      );
    }

    // Note: realtime delivery is handled by the client polling
    // GET /api/chat/messages on an interval — no external realtime
    // service is required here.

    return NextResponse.json(message);
  } catch (error) {
    console.error('[CHAT SEND ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
