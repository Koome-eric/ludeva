import { requireUser } from '@/lib/auth-guard';
import { getOrCreateChatRoom } from '@/lib/chat';
import MemberChatClient from '@/components/MemberChatClient';

export default async function MemberChatPage() {
  const user = await requireUser();
  const chatRoom = await getOrCreateChatRoom(user.id);

  return (
    <MemberChatClient
      initialRoom={chatRoom}
      currentUserId={user.id}
    />
  );
}
