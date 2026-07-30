import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getOrCreateChatRoom } from '@/lib/chat';

// Opens (or creates) a chat room between the requesting admin and a member,
// used when an admin finds a member via search who doesn't have a
// conversation yet.
export async function POST(req: NextRequest) {
  const { user: admin, error } = await requireAdminApi();
  if (error) return error;

  let body: { memberId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.memberId) {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
  }

  try {
    const room = await getOrCreateChatRoom(body.memberId, admin!.id);
    return NextResponse.json(room);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to start chat' }, { status: 500 });
  }
}
