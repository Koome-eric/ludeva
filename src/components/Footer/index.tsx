"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-white pt-16 dark:bg-gray-dark md:pt-20 lg:pt-24">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          {/* Logo & Description */}
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
            <div className="mb-12 max-w-[360px] lg:mb-16">
              <Link href="/" className="mb-8 inline-block">
                <Image
                  src="/images/logo/logo-light.svg"
                  alt="Ludeva Logo"
                  className="w-full dark:hidden"
                  width={140}
                  height={30}
                />
                <Image
                  src="/images/logo/logo-dark.svg"
                  alt="Ludeva Logo"
                  className="hidden w-full dark:block"
                  width={140}
                  height={30}
                />
              </Link>
              <p className="mb-9 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                Ludeva Public Ltd empowers Kenyans to invest confidently across money markets, real estate, agriculture, and SMEs.
              </p>
              <div className="flex items-center space-x-5">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  aria-label="Facebook"
                  className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                >
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="currentColor">
                    <path d="M12.1 10.5V7.43c0-1.19.99-2.15 2.2-2.15h2.2V2.05l-2.99-.21C10.97 1.67 8.8 3.64 8.8 6.13V10.5H5.5v3.22H8.8v6.45h3.3v-6.45h3.3l1.1-3.22h-4.4z" />
                  </svg>
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  aria-label="LinkedIn"
                  className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                >
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="currentColor">
                    <path d="M15.2 0H2c-.62 0-1.12.5-1.12 1.12v13.18c0 .6.5 1.12 1.12 1.12h13.17c.63 0 1.13-.5 1.13-1.12V1.1C16.3.5 15.8 0 15.2 0ZM5.45 13.11H3.17V5.77h2.28v7.34ZM4.3 4.75c-.75 0-1.32-.6-1.32-1.32 0-.72.6-1.31 1.32-1.31.73 0 1.32.6 1.32 1.31 0 .73-.6 1.32-1.32 1.32ZM14.07 13.11h-2.27V9.55c0-.84-.02-1.96-1.17-1.96-1.2 0-1.37.95-1.37 1.9v3.63H6.95V5.77H9.17v1.02h.03c.31-.6 1.04-1.19 2.17-1.19 2.33 0 2.76 1.5 2.76 3.54v3.97h-.03Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Explore Links */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-6 text-xl font-bold text-black dark:text-white">Explore</h2>
              <ul>
                <li>
                  <Link href="/investments" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Investments
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Insights
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Links */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-6 text-xl font-bold text-black dark:text-white">Legal</h2>
              <ul>
                <li>
                  <Link href="/terms" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Links */}
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-6 text-xl font-bold text-black dark:text-white">Get in Touch</h2>
              <ul>
                <li>
                  <Link href="/contact" className="mb-4 block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                
              </ul>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]" />
        <div className="py-8 text-center">
          <p className="text-base text-body-color dark:text-white">
            © {new Date().getFullYear()} Ludeva Public Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
