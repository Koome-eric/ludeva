// src/components/HeroSection.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Home hero — full-bleed photo with the (transparent) site header floating
// over it, a big editorial headline with one highlighted word, glass CTAs,
// and small floating info cards.
export default function HeroSection() {
  return (
    <section
      data-hero
      // pulled up under the sticky 4.5rem header so the photo runs edge to edge
      className="relative -mt-[4.5rem] flex min-h-[100svh] flex-col overflow-hidden bg-[hsl(240_100%_7%)] text-white"
    >
      {/* Photo */}
      <Image
        src="/images/hero3.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_35%]"
      />
      {/* Navy wash: dense behind the copy, opening up over the people */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(240_100%_6%/0.94)_0%,hsl(240_90%_11%/0.78)_38%,hsl(240_90%_12%/0.28)_72%,hsl(240_90%_12%/0.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(240_100%_6%/0.55)_0%,transparent_22%,transparent_62%,hsl(240_100%_6%/0.75)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      {/* Floating note — top right */}
      <div className="fade-up fade-up-3 absolute right-6 top-32 z-10 hidden w-64 items-start gap-3 rounded-2xl bg-white/95 p-4 text-[hsl(236_45%_12%)] shadow-lift backdrop-blur lg:flex xl:right-12">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
          <ShieldCheck className="h-[18px] w-[18px]" />
        </span>
        <p className="text-[12.5px] leading-snug">
          Regulated, transparent and built for Kenyan investors at every stage.
        </p>
      </div>

      {/* Copy */}
      <div className="container relative z-10 mx-auto flex flex-1 flex-col justify-center px-4 pb-24 pt-32 lg:px-6">
        <div className="max-w-3xl">
          <span className="fade-up inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_hsl(var(--gold))]" />
            Ludeva Plc · Building wealth together
          </span>

          <h1 className="hero-heading fade-up fade-up-1 mt-6 text-[2.15rem] sm:text-[2.85rem] lg:text-[4rem]">
            Grow your
            <br />
            wealth with{' '}
            <span className="text-gold-gradient">confidence.</span>
            <br />
            Every day.
          </h1>

          <p className="fade-up fade-up-2 mt-7 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Accessible, secure and smart investments in Kenya — equities, government
            securities and fixed-income savings, tailored to your goals and guided by
            people who listen first.
          </p>

          <div className="fade-up fade-up-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold" className="h-12 rounded-full px-7">
              <Link href="/sign-up">
                Start Investing <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur hover:border-white hover:bg-white hover:text-[hsl(240_100%_16%)]"
            >
              <Link href="/contact">
                Request a Consultation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Cards — in flow on small screens, floated bottom-right on desktop */}
          <div className="fade-up fade-up-4 mt-10 grid grid-cols-2 gap-3 lg:absolute lg:bottom-24 lg:right-6 lg:mt-0 lg:w-[34rem] xl:right-12">
            <HeroCard href="/mmf" index="01 / Money Market Fund" title="Start with your goals." body="A stable, low-risk foundation for every portfolio." />
            <HeroCard href="/stocks-bonds" index="02 / Stocks & Bonds" title="From savings to equities." body="Explore the products that grow with you." />
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div className="container relative z-10 mx-auto flex items-center justify-between px-4 pb-7 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 lg:px-6">
        <span>Ludeva / Investments</span>
        <a href="#explore" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
          Scroll to explore <ArrowDown className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}

function HeroCard({ href, index, title, body }: { href: string; index: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="hero-card group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 sm:p-5"
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[hsl(236_20%_40%)]">{index}</p>
      <p className="mt-3 flex items-start justify-between gap-2 font-headline text-[15px] font-semibold leading-snug sm:text-base">
        {title}
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </p>
      <p className="mt-1.5 text-[12.5px] leading-snug text-[hsl(236_15%_38%)]">{body}</p>
    </Link>
  );
}
