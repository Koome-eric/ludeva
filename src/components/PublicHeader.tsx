'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import menuData from '@/lib/menu-data';

export default function PublicHeader() {
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  // `top` = scrolled to the very top. Together with a page hero this makes
  // the bar transparent (see .site-header rules in globals.css).
  const [top, setTop] = React.useState(true);
  React.useEffect(() => {
    const onScroll = () => setTop(window.scrollY < 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <header
      data-top={top}
      className="site-header sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 shadow-sm backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between gap-4 px-4 lg:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* Light mode logo */}
          <Image
            src="/images/logo_light.png"
            alt="Ludeva Logo"
            width={140}
            height={40}
            className="logo-light block dark:hidden object-contain"
            priority
          />

          {/* Dark mode logo */}
          <Image
            src="/images/logo_dark.png"
            alt="Ludeva Logo"
            width={140}
            height={40}
            className="logo-dark hidden dark:block object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="relative hidden flex-1 items-center justify-center gap-1 lg:flex">
          {menuData.map((item) => (
            <div key={item.id} className="relative">
              {item.submenu ? (
                <>
                  <Button
                    variant="ghost"
                    className="nav-link flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-foreground/80 hover:bg-accent"
                    onClick={() => toggleMenu(item.id)}
                  >
                    {item.title}
                    {openMenuId === item.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {openMenuId === item.id && (
                    <div className="absolute left-0 mt-2 min-w-[200px] rounded-2xl border border-border/60 bg-card shadow-lift py-2 px-1 z-50">
                      {item.submenu.map((subItem, index) => (
                        <div key={subItem.id}>
                          <Link
                            href={subItem.path || '#'}
                            className={`block px-4 py-2 text-sm rounded-md ${
                              pathname === subItem.path
                                ? 'text-primary font-semibold'
                                : 'text-gray-700 dark:text-white'
                            }`}
                          >
                            {subItem.title}
                          </Link>

                          {index !== item.submenu!.length - 1 && (
                            <div className="mx-auto my-1 w-[70%] border-b border-gray-300 dark:border-gray-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path || '#'}
                  data-active={pathname === item.path}
                  className={`nav-link rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors hover:bg-accent ${
                    pathname === item.path
                      ? 'font-semibold text-primary'
                      : 'text-foreground/80'
                  }`}
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <span className="hdr-on-hero"><ThemeToggle /></span>

          <Link
            href="/sign-in"
            className="nav-link hidden rounded-full px-4 py-2 text-[13.5px] font-medium text-foreground/80 transition-colors hover:bg-accent md:block"
          >
            Log In
          </Link>

          <Button asChild variant="gold" className="hidden h-11 rounded-full px-6 md:inline-flex">
            <Link href="/sign-up">
              Get Started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={openSheet} onOpenChange={setOpenSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="hdr-on-hero rounded-full bg-transparent md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 p-4">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">
                Browse pages and account links for Ludeva.
              </SheetDescription>
              <nav className="flex flex-col gap-2 mt-2">
                {menuData.map((item) =>
                  item.submenu ? (
                    <details key={item.id}>
                      <summary className="flex justify-between items-center px-4 py-2 cursor-pointer rounded-md bg-gray-50 dark:bg-gray-700">
                        {item.title}
                      </summary>
                      <div className="pl-4 mt-1 flex flex-col gap-1">
                        {item.submenu.map((subItem, index) => (
                          <div key={subItem.id}>
                            <Link
                              href={subItem.path || '#'}
                              onClick={() => setOpenSheet(false)}
                              className={`block px-4 py-2 text-sm rounded-md ${
                                pathname === subItem.path
                                  ? 'text-primary font-semibold'
                                  : 'text-gray-700 dark:text-white'
                              }`}
                            >
                              {subItem.title}
                            </Link>

                            {index !== item.submenu!.length - 1 && (
                              <div className="mx-auto my-1 w-[70%] border-b border-gray-300 dark:border-gray-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.path || '#'}
                      onClick={() => setOpenSheet(false)}
                      className={`px-4 py-2 text-sm rounded-md ${
                        pathname === item.path
                          ? 'text-primary font-semibold'
                          : 'text-gray-700 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </Link>
                  )
                )}
              </nav>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setOpenSheet(false)}
                  className="px-4 py-2 text-center rounded-md text-gray-700 dark:text-white"
                >
                  Log In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setOpenSheet(false)}
                  className="px-4 py-2.5 text-center rounded-xl bg-gold-gradient font-semibold shadow-glow"
                >
                  Get Started
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
