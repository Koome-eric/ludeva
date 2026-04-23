import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient, auth } from '@clerk/nextjs/server';

/**
 * Sync the role from your database into Clerk metadata
 * This ensures middleware can correctly redirect admins
 */
export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user from your DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    // Update Clerk metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: dbUser.role },
    });

    return NextResponse.json({ success: true, role: dbUser.role });
  } catch (error) {
    console.error('Sync role error:', error);
    return NextResponse.json({ error: 'Failed to sync role' }, { status: 500 });
  }
};
