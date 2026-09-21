'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Shared shell for the Clerk /sign-in and /sign-up pages — centers the
 * widget in a premium fintech layout (soft gradient backdrop, brand logo,
 * a constrained card width) and stays correctly centered/scrollable on
 * every screen size, including small phones:
 *  - `min-h-[100dvh]` instead of `min-h-screen` so mobile browser chrome
 *    (address bar showing/hiding) doesn't shift or clip the widget.
 *  - `env(safe-area-inset-*)` padding so it clears notches/home-bar areas.
 *  - the gradient blobs are `-z-10` and clipped by `overflow-hidden` on
 *    the outer wrapper, so they can never cause horizontal scroll.
 *  - the Clerk widget itself is told to fill its container (`w-full`) via
 *    the `appearance` prop on <SignIn/>/<SignUp/> rather than a fixed
 *    width, so it naturally reflows instead of overflowing on narrow
 *    screens.
 */
export function AuthShell({
  subtitle,
  footer,
  children,
}: {
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6"
      style={{
        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Decorative brand gradient backdrop — purely visual, never affects layout/scroll */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[16rem] w-[16rem] rounded-full bg-primary/10 blur-3xl sm:h-[20rem] sm:w-[20rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.06)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <div className="flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-6 flex items-center">
          <Image
            src="/images/logo_light.png"
            alt="Ludeva"
            width={148}
            height={42}
            className="block h-9 w-auto object-contain dark:hidden"
            priority
          />
          <Image
            src="/images/logo_dark.png"
            alt="Ludeva"
            width={148}
            height={42}
            className="hidden h-9 w-auto object-contain dark:block"
            priority
          />
        </Link>

        <p className="mb-6 text-center text-sm text-muted-foreground">{subtitle}</p>

        {/* w-full so the Clerk card (told to be w-full via its own
            appearance prop) is centered and never wider than this shell */}
        <div className="flex w-full justify-center">{children}</div>

        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}
