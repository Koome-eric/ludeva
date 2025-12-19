"use client";

import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-gray-900 pt-[120px] pb-16 md:pt-[150px] md:pb-[120px] xl:pt-[180px] xl:pb-[160px] 2xl:pt-[210px] 2xl:pb-[200px]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero3.jpg"
          alt="Ludeva Money Market Fund"
          fill
          priority
          className="object-cover"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Content */}
          <div className="w-full lg:w-1/2">
            <div className="max-w-xl text-white">
              <span className="mb-4 block text-sm uppercase tracking-widest text-primary">
                Ludeva Money Market Fund (MMF)
              </span>

              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Grow Your Wealth Safely with Daily Returns
              </h1>

              <p className="mb-8 text-base text-gray-200 sm:text-lg md:text-xl">
                Earn consistent returns through the Ludeva Money Market Fund — a low-risk,
                professionally managed investment designed for everyday Kenyans.
                Start investing today from as little as <strong>KES 500</strong>.
              </p>

              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="rounded-xs bg-primary px-8 py-4 text-base font-semibold text-white transition hover:bg-primary/90"
                >
                  Invest Now
                </Link>

                <Link
                  href="/services/money-market"
                  className="inline-flex items-center rounded-xs border border-white/70 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  How MMF Works
                  <svg
                    className="ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </Link>
              </div>

              {/* Trust Section */}
              <div className="mt-10">
                <span className="mb-4 block text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Trusted by investors across Kenya
                </span>
                <div className="flex items-center gap-6 opacity-90">
                  <Image
                    src="/images/brands/uideck.svg"
                    alt="Finance Partner"
                    width={110}
                    height={30}
                  />
                  <Image
                    src="/images/brands/tailadmin.svg"
                    alt="Investment Brand"
                    width={90}
                    height={30}
                  />
                  <Image
                    src="/images/brands/graygrids.svg"
                    alt="Trusted Network"
                    width={110}
                    height={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
