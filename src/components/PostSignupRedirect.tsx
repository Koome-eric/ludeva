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
    if (!isLoaded) return;

    // No signed-in user yet (an anonymous visitor just viewing /sign-in or
    // /sign-up) - there is nothing to check or redirect, so stop "checking"
    // immediately instead of leaving it true forever. Leaving it true was
    // the actual bug: the render below shows a full-screen overlay while
    // checking is true, which was permanently covering the Clerk sign-in
    // form for every anonymous visitor since this effect used to return
    // early (skipping setChecking(false) entirely) whenever there was no
    // user, rather than only skipping the redirect logic itself.
    if (!user) {
      setChecking(false);
      return;
    }

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

  // Only ever show the overlay while there is a signed-in user whose
  // redirect target we are actively resolving - never merely because
  // Clerk itself hasn't finished loading yet, and never for an anonymous
  // visitor, so the sign-in/sign-up form is always visible immediately.
  if (isLoaded && user && checking) {
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