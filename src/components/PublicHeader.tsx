'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import menuData from '@/lib/menu-data';

export default function PublicHeader() {
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-6 py-2.5">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* Light mode logo */}
          <Image
            src="/images/logo_light.png"
            alt="Ludeva Logo"
            width={140}
            height={40}
            className="block dark:hidden object-contain"
            priority
          />

          {/* Dark mode logo */}
          <Image
            src="/images/logo_dark.png"
            alt="Ludeva Logo"
            width={140}
            height={40}
            className="hidden dark:block object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 relative">
          {menuData.map((item) => (
            <div key={item.id} className="relative">
              {item.submenu ? (
                <>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 px-3 py-2 text-gray-700 dark:text-white"
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
                    <div className="absolute left-0 mt-2 min-w-[180px] rounded-md bg-white dark:bg-gray-800 shadow-lg py-2 z-50">
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
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === item.path
                      ? 'text-primary font-semibold'
                      : 'text-gray-700 dark:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/sign-in">Log In</Link>
          </Button>

          <Button asChild className="hidden md:flex bg-primary text-white">
            <Link href="/sign-up">Get Started</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={openSheet} onOpenChange={setOpenSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 p-4">
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
                  className="px-4 py-2 text-center rounded-md bg-primary text-white"
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
