import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import AdminChatClient from '@/components/AdminChatClient';

export default async function AdminChatPage() {
  const admin = await requireAdmin();

  const rooms = await prisma.chatRoom.findMany({
    include: {
      member: {
        select: { id: true, fullName: true, email: true },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <AdminChatClient
      initialRooms={rooms}
      currentUserId={admin.id}
    />
  );
}
