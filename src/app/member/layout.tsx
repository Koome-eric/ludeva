"use client";

import Image from "next/image";
import { CirclePlus, FileText, GanttChartSquare, LayoutDashboard, MessageCircle, PiggyBank, Repeat, TrendingUp, User, Wallet, Layers, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { SidebarUserCard } from "@/components/brand/SidebarUserCard";

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
const menuSections = [
  {
    label: "Overview",
    items: [
      { href: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/member/reports", label: "My Reports", icon: TrendingUp },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/member/deposit", label: "Make a Deposit", icon: CirclePlus },
      { href: "/member/investments", label: "My Investments", icon: GanttChartSquare },
      { href: "/member/products", label: "Ludeva Products", icon: Layers },
      { href: "/member/accounts", label: "Accounts", icon: Wallet },
      { href: "/member/savings", label: "Savings Account", icon: PiggyBank },
      { href: "/member/transactions", label: "Transactions", icon: Repeat },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/member/chat", label: "Messages", icon: MessageCircle },
      { href: "/member/notifications", label: "Notifications", icon: Bell },
      { href: "/member/profile", label: "Profile & KYC", icon: User },
    ],
  },
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
          <Link href="/member/dashboard" className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]/sidebar:justify-center">
            <Image
              src="/images/logo_dark.png"
              alt="Ludeva Logo"
              width={132}
              height={48}
              className="object-contain group-data-[collapsible=icon]/sidebar:w-8"
              priority
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {menuSections.map((section, i) => (
            <div key={section.label} className={i === 0 ? "" : "pt-5"}>
              <p className="pb-1.5 pl-[3.375rem] pr-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/35 group-data-[collapsible=icon]/sidebar:hidden">
                {section.label}
              </p>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href} className="flex w-full items-center">
                          <item.icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>

                          {item.href === "/member/notifications" && unreadCount > 0 && (
                            <span className="ml-auto shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground group-data-[collapsible=icon]/sidebar:hidden">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>

        <div className="group-data-[collapsible=icon]/sidebar:hidden">
          <SidebarUserCard
            name={user?.fullName || "Member"}
            subtitle={user?.primaryEmailAddress?.emailAddress}
            imageUrl={user?.imageUrl}
          >
            <Link
              href="/member/chat"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gold-gradient px-3 py-2 text-xs font-bold shadow-glow transition hover:brightness-105"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Contact support
            </Link>
          </SidebarUserCard>
        </div>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-[4.25rem] items-center gap-4 border-b border-border/50 bg-background/80 px-4 shadow-[0_1px_0_0_hsl(var(--gold)/0.18)] backdrop-blur-xl sm:px-6 md:rounded-t-3xl">
          <SidebarTrigger className="md:hidden" />

          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-headline text-[17px] font-bold leading-tight tracking-tight">Welcome, {firstName}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>

          <div className="ml-auto flex items-center gap-0.5 rounded-2xl border border-border/60 bg-card p-1 shadow-soft sm:gap-1 sm:p-1.5">
            <NotificationsBell onUnreadChange={setUnreadCount} />
            <ThemeToggle />
            <span className="mx-1 h-6 w-px bg-border" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-xl ring-2 ring-gold/60",
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
