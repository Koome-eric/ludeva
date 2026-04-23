"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import Image from "next/image";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNotificationsBell } from "@/components/AdminNotificationsBell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        {/* ✅ LOGO (Same as Public Header/Footer) */}
        <SidebarHeader className="border-b px-3 py-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center"
          >
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
        </SidebarHeader>

        <SidebarContent>
          <AdminSidebar />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* ✅ Top Header */}
        <header
          className="sticky top-0 z-40 flex h-14 items-center gap-4
          border-b bg-background/80 backdrop-blur px-4 sm:px-6"
        >
          <SidebarTrigger className="md:hidden" />

          <div className="ml-auto flex items-center gap-4">
            <AdminNotificationsBell />
            <ThemeToggle />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-lg",
                },
              }}
            />
          </div>
        </header>

        {/* ✅ Main Content */}
        <main className="flex-1 bg-muted/40">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}