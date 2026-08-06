'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PostAuthPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const SUPER_ADMIN_CLERK_IDS = [
    'user_3HXA2IEixF5gsA8QUNz0bzvk7B2',
    'user_3HXCbicqEmKShQGMcqzCKQBtNcw',
    'user_38qCNW1RIEGrQ6rORph6s2348NX',
  ];

  useEffect(() => {
    if (!isLoaded || !user) return;

    const routeUser = async () => {
      try {
        if (SUPER_ADMIN_CLERK_IDS.includes(user.id)) {
          router.replace('/admin/dashboard');
          return;
        }

        const res = await fetch('/api/auth/check-user', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkId: user.id }),
        });

        if (!res.ok) {
          console.error(`API error: ${res.status} ${res.statusText}`);
          router.replace('/sign-in');
          return;
        }

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
      } catch (error) {
        console.error('Error checking user:', error);
        router.replace('/sign-in');
      }
    };

    routeUser();
  }, [isLoaded, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Redirecting...
    </div>
  );
}
