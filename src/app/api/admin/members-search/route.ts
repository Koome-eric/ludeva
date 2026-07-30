import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

// Lets an admin search across ALL members (not just ones with an existing
// chat room) so they can start a new conversation. This is what backs the
// member search box on the admin chat page.
export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json([]);
  }

  const members = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, fullName: true, email: true, phone: true },
    take: 20,
  });

  return NextResponse.json(members);
}
