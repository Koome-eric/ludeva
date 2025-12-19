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
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSubmenu = (id: number) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 z-40 w-full transition ${
          sticky ? "bg-white shadow dark:bg-gray-900" : "bg-white dark:bg-gray-900"
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

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center space-x-10">
              {menuData.map((item) => (
                <div key={item.id} className="relative">
                  {item.path ? (
                    <Link
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
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-dark dark:text-white/70">
                        {item.title}
                      </span>

                      {/* Arrow toggle */}
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className="p-1"
                        aria-label="Toggle submenu"
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            openSubmenu === item.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* DESKTOP SUBMENU */}
                  {item.submenu && (
                    <div
                      className={`absolute left-0 top-full mt-3 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
                        openSubmenu === item.id
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.path}
                          className="block px-4 py-3 text-sm text-dark hover:bg-gray-100 dark:text-white/70 dark:hover:bg-gray-800"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-6">
              <a
                href="https://ludeva-dashboard.vercel.app/signin"
                target="_blank"
                className="text-sm font-medium text-dark dark:text-white"
              >
                Sign In
              </a>

              <a
                href="https://ludeva-dashboard.vercel.app/signup"
                target="_blank"
                className="rounded-xs bg-primary px-5 py-2 text-sm font-medium text-white"
              >
                Sign Up
              </a>

              <ThemeToggler />
            </div>

            {/* MOBILE CONTROLS */}
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggler />
              <button
                onClick={() => setNavbarOpen(true)}
                className="p-2"
                aria-label="Open menu"
              >
                <span className="block h-0.5 w-6 bg-black dark:bg-white mb-1" />
                <span className="block h-0.5 w-6 bg-black dark:bg-white mb-1" />
                <span className="block h-0.5 w-6 bg-black dark:bg-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 transition-transform duration-300 lg:hidden ${
          navbarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
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
            >
              ✕
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        <nav className="px-6 mt-8 space-y-4">
          {menuData.map((item) => (
            <div key={item.id}>
              {item.path ? (
                <Link
                  href={item.path}
                  onClick={() => setNavbarOpen(false)}
                  className="block text-lg font-medium text-dark dark:text-white"
                >
                  {item.title}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className="flex w-full items-center justify-between text-lg font-medium text-dark dark:text-white"
                  >
                    {item.title}
                    <span className="text-xl">
                      {openSubmenu === item.id ? "▲" : "▼"}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSubmenu === item.id
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-3 ml-4 space-y-3">
                      {item.submenu?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.path}
                          onClick={() => setNavbarOpen(false)}
                          className="block text-base text-gray-600 dark:text-gray-400"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Actions */}
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
