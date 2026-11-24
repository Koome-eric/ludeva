"use client";

import Image from "next/image";
import {
  CirclePlus,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  MessageCircle,
  PiggyBank,
  Repeat,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsBell } from "@/components/NotificationsBell";
import { cn } from "@/lib/utils";

// ---------- Sidebar Menu Items ----------
const menuItems = [
  { href: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/member/deposit", label: "Make a Deposit", icon: CirclePlus },
  { href: "/member/investments", label: "My Investments", icon: GanttChartSquare },
  { href: "/member/products", label: "Ludeva Products", icon: LayoutDashboard },
  { href: "/member/accounts", label: "Accounts", icon: Wallet },
  { href: "/member/transactions", label: "Transactions", icon: Repeat },
  { href: "/member/chat", label: "Messages", icon: MessageCircle },
  { href: "/member/notifications", label: "Notifications", icon: FileText },
  { href: "/member/reports", label: "My Reports", icon: TrendingUp },
  { href: "/member/savings", label: "Savings Account", icon: PiggyBank },
  { href: "/member/profile", label: "Profile & KYC", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        {/* Brand — the navy sidebar always uses the white logo */}
        <SidebarHeader>
          <Link href="/member/dashboard" className="flex items-center gap-2 px-1 py-1">
            <Image
              src="/images/logo_dark.png"
              alt="Ludeva Logo"
              width={132}
              height={48}
              className="object-contain group-data-[collapsible=icon]:w-8"
              priority
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <p className="px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
            Menu
          </p>
          <SidebarMenu>
            {menuItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>

                      {item.href === "/member/notifications" && unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sidebar-foreground">
          <p className="text-sm font-semibold text-gold">Building wealth together</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            Questions about your account? Message our team any time.
          </p>
          <Link
            href="/member/chat"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gold-gradient px-3 py-1.5 text-xs font-bold shadow-glow transition hover:brightness-105"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Contact support
          </Link>
        </div>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl sm:px-6 md:rounded-t-3xl">
          <SidebarTrigger className="md:hidden" />

          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-headline text-base font-bold leading-tight">Welcome, {firstName}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <NotificationsBell onUnreadChange={setUnreadCount} />
            <ThemeToggle />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 rounded-xl ring-2 ring-gold/60",
                },
              }}
            />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
