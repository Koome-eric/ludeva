'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function PostSignupRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const SUPER_ADMIN_CLERK_ID = 'user_38qCNW1RIEGrQ6rORph6s2348NX';

  useEffect(() => {
    if (!isLoaded || !user) return;

    const redirect = async () => {
      try {
        // SUPER ADMIN
        if (user.id === SUPER_ADMIN_CLERK_ID) {
          router.replace('/admin/dashboard');
          return;
        }

        // Always check DB first
        const res = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkId: user.id }),
        });

        const data = await res.json();

        if (!data.exists || !data.onboardingCompleted) {
          router.replace('/onboarding/investment');
          return;
        }

        if (data.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/member/dashboard');
        }
      } catch (err) {
        console.error('[POST-SIGNUP]', err);
        router.replace('/onboarding/investment');
      } finally {
        setChecking(false);
      }
    };

    redirect();
  }, [isLoaded, user, router]);

  if (!isLoaded || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Setting up your account…</p>
      </div>
    );
  }

  return null;
}