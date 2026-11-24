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
import { AdminAccessProvider } from "@/components/admin/AdminAccessProvider";

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
    <AdminAccessProvider>
    <SidebarProvider>
      <Sidebar>
        {/* Brand — the navy sidebar always uses the white logo */}
        <SidebarHeader>
          <Link href="/admin/dashboard" className="flex items-center gap-2 px-1 py-1">
            <Image
              src="/images/logo_dark.png"
              alt="Ludeva Logo"
              width={132}
              height={48}
              className="object-contain"
              priority
            />
            <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold">
              Admin
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <AdminSidebar />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl sm:px-6 md:rounded-t-3xl">
          <SidebarTrigger className="md:hidden" />

          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-headline text-base font-bold leading-tight">Admin Console</p>
            <p className="text-xs text-muted-foreground">Ludeva Investments</p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <AdminNotificationsBell />
            <ThemeToggle />
            <AdminAccountControl />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
    </AdminAccessProvider>
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
          avatarBox: "h-10 w-10 rounded-xl ring-2 ring-gold/60",
        },
      }}
    />
  );
}