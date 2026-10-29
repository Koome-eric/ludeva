import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type Props = {
  /** What this screen is for, in the brand panel's voice. */
  headline: string;
  subline: string;
  /** Optional line under the form (cross-links, admin sign-in pointer). */
  footer?: ReactNode;
  children: ReactNode;
};

const PROMISES = [
  'Professionally managed Money Market Fund investments',
  'Strong governance and disciplined risk management',
  'Your investments, deposits and withdrawals in one dashboard',
];

// Shared frame for sign-in and sign-up. The left panel carries the Ludeva
// identity; the right panel holds the Clerk form. On phones the panel
// collapses to a compact brand bar so the form stays above the fold.
//
// Layout notes:
//  - `min-h-[100dvh]` (not `min-h-screen`) so mobile browser chrome showing /
//    hiding doesn't clip the form.
//  - safe-area insets keep content clear of notches and home bars.
//  - the artwork is absolutely positioned inside an `overflow-hidden` panel,
//    so it can never cause horizontal scroll.
export function AuthShell({ headline, subline, footer, children }: Props) {
  return (
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <aside
        className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand-dark px-6 py-6 lg:px-12 lg:py-12"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <Link href="/" aria-label="Ludeva home" className="relative z-10 inline-flex w-fit">
          <Image
            src="/images/logo_dark.png"
            alt="Ludeva — Building Wealth Together"
            width={148}
            height={57}
            priority
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        <div className="relative z-10 hidden max-w-md lg:block">
          <h1 className="font-headline text-balance text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-white/75">{subline}</p>
          <ul className="mt-8 space-y-3">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <Image
          src="/images/art-auth.svg"
          alt=""
          aria-hidden="true"
          width={640}
          height={620}
          className="pointer-events-none absolute -bottom-24 -right-24 hidden w-[34rem] max-w-none opacity-60 xl:block"
        />

        <p className="relative z-10 hidden text-sm text-white/60 lg:block">
          © {new Date().getFullYear()} Ludeva Plc, Kenya. Building wealth together.
        </p>
      </aside>

      <main
        className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <ThemeToggle />
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <div className="mb-2 text-center lg:hidden">
            <h1 className="font-headline text-balance text-2xl font-bold tracking-tight">{headline}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subline}</p>
          </div>

          {children}

          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}

          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
              Privacy policy
            </Link>
            {' · '}
            <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
              Need help?
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
