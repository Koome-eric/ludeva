// src/components/HeroSection.tsx
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero3.jpg')",
        }}
      />

      {/* Dark Linear Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_100%_7%)]/90 via-[hsl(240_90%_14%)]/75 to-[hsl(240_100%_7%)]/92" />

      {/* Content */}
      <div className="relative z-10 container px-4 py-14 sm:py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur">
            Building wealth together
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-headline leading-tight">
            Accessible, Secure & Smart Investments in Kenya
          </h1>

          <p className="text-base sm:text-lg text-white/90">
            Ludeva Plc is a trusted investment partner providing accessible
            wealth-management solutions across equities, government
            securities and fixed-income savings. We help clients diversify
            portfolios, preserve capital, and optimize returns through
            tailored investment solutions aligned with their financial goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
            <Button asChild size="lg" variant="gold" className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start Investing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 text-white border border-white/30 backdrop-blur hover:bg-white hover:text-[hsl(240_100%_16%)] transition-all duration-200"
            >
              <Link href="/contact">Request a Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
