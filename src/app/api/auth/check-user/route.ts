export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clerkId } = await request.json();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      onboardingCompleted: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { exists: false, onboardingCompleted: false, role: null },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  }

  return NextResponse.json(
    {
      exists: true,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    }
  );
}
