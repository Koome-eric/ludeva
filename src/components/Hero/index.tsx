"use client";

import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] dark:bg-gray-900 md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
            <div className="max-w-xl">
              <span className="text-sm uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-4 block">
                Accessible Investment for Everyone
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-black dark:text-white mb-4">
                Invest in Kenya’s Future, One Opportunity at a Time
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
                Ludeva empowers individuals to grow their wealth through
                regulated money market funds, real estate, agriculture, and SME
                investments—all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <Link
                  href="/signup"
                  className="rounded-xs bg-blue-700 px-8 py-4 text-base font-semibold text-white hover:bg-blue-800 transition"
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center rounded-xs border border-gray-800 px-8 py-4 text-base font-semibold text-gray-800 hover:bg-gray-800 hover:text-white transition dark:border-white dark:text-white dark:hover:bg-white/10"
                >
                  Learn More
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

              <div className="mt-8">
                <span className="block uppercase text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Trusted by everyday Kenyans and local businesses
                </span>
                <div className="flex items-center gap-6">
                  <Image
                    src="/images/brands/uideck.svg"
                    alt="Udev Bank"
                    width={110}
                    height={30}
                  />
                  <Image
                    src="/images/brands/tailadmin.svg"
                    alt="AgriVest"
                    width={90}
                    height={30}
                  />
                  <Image
                    src="/images/brands/graygrids.svg"
                    alt="KIFund"
                    width={110}
                    height={30}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 relative pl-12">
            <div className="relative w-full max-w-xl mx-auto">
              <Image
                src="/images/hero-img-1-min.jpg"
                alt="Investing in Kenya"
                width={480}
                height={320}
                className="rounded-3xl shadow-lg mb-6"
              />
              <Image
                src="/images/card-expenses.png"
                alt="Ludeva Dashboard Preview"
                width={480}
                height={320}
                className="rounded-3xl shadow-xl absolute top-20 left-12 w-full max-w-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
