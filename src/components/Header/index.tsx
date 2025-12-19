"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  const pathname = usePathname();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 z-40 w-full transition ${
          sticky
            ? "bg-white shadow dark:bg-gray-900"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo/logo-dark.png"
                alt="Ludeva"
                width={135}
                height={30}
                className="hidden dark:block"
              />
              <Image
                src="/images/logo/logo-light.png"
                alt="Ludeva"
                width={135}
                height={30}
                className="dark:hidden"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-10">
              {menuData.map((item, i) =>
                item.path ? (
                  <Link
                    key={i}
                    href={item.path}
                    className={`text-sm font-medium ${
                      pathname === item.path
                        ? "text-primary"
                        : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span
                    key={i}
                    className="text-sm font-medium text-dark/60 dark:text-white/60"
                  >
                    {item.title}
                  </span>
                )
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <a
                href="https://ludeva-dashboard.vercel.app/signin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-dark dark:text-white"
              >
                Sign In
              </a>

              <a
                href="https://ludeva-dashboard.vercel.app/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xs bg-primary px-5 py-2 text-sm font-medium text-white"
              >
                Sign Up
              </a>

              <ThemeToggler />
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggler />

              <button
                onClick={() => setNavbarOpen(true)}
                aria-label="Open menu"
                className="p-2"
              >
                <span className="block h-0.5 w-6 bg-black dark:bg-white mb-1" />
                <span className="block h-0.5 w-6 bg-black dark:bg-white mb-1" />
                <span className="block h-0.5 w-6 bg-black dark:bg-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FULLSCREEN MENU */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 lg:hidden ${
          navbarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" onClick={() => setNavbarOpen(false)}>
            <Image
              src="/images/logo/logo-dark.png"
              alt="Ludeva"
              width={130}
              height={28}
              className="hidden dark:block"
            />
            <Image
              src="/images/logo/logo-light.png"
              alt="Ludeva"
              width={130}
              height={28}
              className="dark:hidden"
            />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggler />
            <button
              onClick={() => setNavbarOpen(false)}
              className="text-2xl dark:text-white"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu links */}
        <nav className="flex flex-col gap-6 px-6 mt-10">
          {menuData.map((item, i) =>
            item.path ? (
              <Link
                key={i}
                href={item.path}
                onClick={() => setNavbarOpen(false)}
                className="text-xl font-medium text-dark dark:text-white"
              >
                {item.title}
              </Link>
            ) : (
              <span
                key={i}
                className="text-xl font-medium text-dark/60 dark:text-white/60"
              >
                {item.title}
              </span>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="mt-12 px-6 flex flex-col gap-4">
          <a
            href="https://ludeva-dashboard.vercel.app/signin"
            className="text-lg text-dark dark:text-white"
          >
            Sign In
          </a>

          <a
            href="https://ludeva-dashboard.vercel.app/signup"
            className="rounded-xs bg-primary px-6 py-3 text-center text-white text-lg"
          >
            Sign Up
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
