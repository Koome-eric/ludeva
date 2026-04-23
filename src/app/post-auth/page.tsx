'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PostAuthPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const routeUser = async () => {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id }),
      });

      const data = await res.json();

      // ❌ Not onboarded → onboarding
      if (!data.exists || !data.onboardingCompleted) {
        router.replace('/onboarding/investment');
        return;
      }

      // ✅ ADMIN → admin dashboard
      if (data.role === 'ADMIN') {
        router.replace('/admin/dashboard');
        return;
      }

      // ✅ MEMBER → member dashboard
      router.replace('/member/dashboard');
    };

    routeUser();
  }, [isLoaded, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Redirecting...
    </div>
  );
}
