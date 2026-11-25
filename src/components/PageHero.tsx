import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowDown } from "lucide-react";

interface PageHeroProps {
  title: string;
  description?: ReactNode;
  imageSrc?: string;
  /** Optional action row (buttons) under the description. */
  children?: ReactNode;
  /** Small caption above the title. */
  eyebrow?: string;
}

// Inner-page hero — same language as the home hero: full-bleed photo under
// the transparent header, navy wash, left-aligned editorial headline with
// the last word highlighted in gold.
export default function PageHero({
  title,
  description,
  imageSrc = "/images/hero3.jpg",
  eyebrow = "Ludeva Plc",
  children,
}: PageHeroProps) {
  const words = title.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop() : null;
  const lead = words.join(" ");

  return (
    <section
      data-hero
      className="relative -mt-[4.5rem] flex min-h-[68svh] flex-col overflow-hidden bg-[hsl(240_100%_7%)] text-white md:min-h-[78svh]"
    >
      <Image src={imageSrc} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(240_100%_6%/0.92)_0%,hsl(240_90%_11%/0.72)_45%,hsl(240_90%_12%/0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(240_100%_6%/0.5)_0%,transparent_25%,transparent_60%,hsl(240_100%_6%/0.7)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="container relative z-10 mx-auto flex flex-1 flex-col justify-center px-4 pb-20 pt-32 lg:px-6">
        <div className="max-w-3xl">
          <span className="fade-up inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_hsl(var(--gold))]" />
            {eyebrow}
          </span>

          <h1 className="hero-heading fade-up fade-up-1 mt-5 text-[2.5rem] sm:text-6xl lg:text-[4.6rem]">
            {lead}
            {last && (
              <>
                {lead ? " " : ""}
                <span className="text-gold-gradient">{last}</span>
              </>
            )}
          </h1>

          {description && (
            <p className="fade-up fade-up-2 mt-6 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
              {description}
            </p>
          )}

          {children && <div className="fade-up fade-up-3 mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
        </div>
      </div>

      <div className="container relative z-10 mx-auto flex items-center justify-between px-4 pb-7 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 lg:px-6">
        <span className="truncate pr-4">Ludeva / {title}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          Scroll to explore <ArrowDown className="h-3.5 w-3.5" />
        </span>
      </div>
    </section>
  );
}
