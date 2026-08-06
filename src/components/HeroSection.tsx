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
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />

      {/* Content */}
      <div className="relative z-10 container px-4 py-14 sm:py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-headline leading-tight">
            Accessible, Secure & Smart Investments in Kenya
          </h1>

          <p className="text-base sm:text-lg text-white/90">
            Ludeva offers a professionally managed Money Market Fund, designed
            to preserve your capital while generating competitive returns.
            Start your wealth creation journey with a partner you can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
            <Button asChild size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Link href="/sign-up">
                Start Investing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white text-black border border-white hover:bg-white hover:text-black focus:text-black active:text-black dark:bg-white dark:text-black dark:hover:text-black transition-all duration-200"
            >
              <Link href="/contact">Request a Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
