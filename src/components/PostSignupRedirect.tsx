'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export function PostSignupRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const SUPER_ADMIN_CLERK_IDS = [
    'user_3HXA2IEixF5gsA8QUNz0bzvk7B2',
    'user_3HXCbicqEmKShQGMcqzCKQBtNcw',
  ];

  useEffect(() => {
    if (!isLoaded || !user) return;

    const redirect = async () => {
      try {
        // SUPER ADMINS bypass onboarding and go straight to admin dashboard
        if (SUPER_ADMIN_CLERK_IDS.includes(user.id)) {
          router.replace('/admin/dashboard');
          return;
        }

        // Always check DB first
        const res = await fetch('/api/auth/check-user', {
          method: 'POST',
          cache: 'no-store',
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
      <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Setting up your account…</p>
        </div>
      </div>
    );
  }

  return null;
}