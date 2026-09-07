"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // /admin/login is the sign-in screen for super-admin-created admin
  // accounts — it must render on its own, without the sidebar/header
  // chrome (and without <UserButton>, which assumes a Clerk session).
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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
            <AdminAccountControl />
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

// Renders Clerk's <UserButton> for Clerk-authenticated admins (super
// admins, and any admin whose role was set the old way). For admins
// created via the "Admin Users" panel — who have no Clerk session at all
// — falls back to a plain logout button that clears the custom session
// cookie via /api/admin/logout.
function AdminAccountControl() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [checkedCustomSession, setCheckedCustomSession] = useState(false);
  const [isCustomSession, setIsCustomSession] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setCheckedCustomSession(true);
      return;
    }
    // No Clerk session loaded — check whether this is a custom
    // admin-account session instead.
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsCustomSession(Boolean(data?.isAdminAccountSession)))
      .finally(() => setCheckedCustomSession(true));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !checkedCustomSession) {
    return <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />;
  }

  if (isCustomSession) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </Button>
    );
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 rounded-lg",
        },
      }}
    />
  );
}