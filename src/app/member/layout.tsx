"use client";

import Image from "next/image";
import {
  CirclePlus,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  Repeat,
  User,
} from "lucide-react";
import { MessageCircle } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { UserButton } from "@clerk/nextjs";

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
  { href: "/member/transactions", label: "Transactions", icon: Repeat },
  { href: "/member/chat", label: "Messages", icon: MessageCircle },
  { href: "/member/notifications", label: "Notifications", icon: FileText },
  { href: "/member/profile", label: "Profile & KYC", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">

        {/* ✅ UPDATED HEADER WITH LOGO */}
        <SidebarHeader className="border-b">
          <Link
            href="/member/dashboard"
            className="flex items-center gap-2 px-2 py-3"
          >
            {/* Light mode logo */}
            <Image
              src="/images/logo_light.png"
              alt="Ludeva Logo"
              width={120}
              height={35}
              className="block dark:hidden object-contain group-data-[collapsible=icon]:w-8"
              priority
            />

            {/* Dark mode logo */}
            <Image
              src="/images/logo_dark.png"
              alt="Ludeva Logo"
              width={120}
              height={35}
              className="hidden dark:block object-contain group-data-[collapsible=icon]:w-8"
              priority
            />

          </Link>
        </SidebarHeader>

        <SidebarContent className="py-2">
          <SidebarMenu>
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                    className={cn(active && "bg-primary/10 text-primary shadow-sm")}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                      <span>{item.label}</span>

                      {item.href === "/member/notifications" && unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
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
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />

          <div className="ml-auto flex items-center gap-4">
            <NotificationsBell onUnreadChange={setUnreadCount} />
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

        <main className="flex-1 bg-muted/40">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}