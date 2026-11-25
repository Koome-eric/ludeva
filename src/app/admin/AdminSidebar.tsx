"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { adminSidebarItems } from "./adminSidebarItems";
import { useAdminAccess } from "@/components/admin/AdminAccessProvider";
import { moduleForPath } from "@/lib/permissions";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AdminSidebar() {
  const pathname = usePathname();
  const { loaded, isSuperAdmin, canView } = useAdminAccess();

  // Show only what this admin may open. Admin management (/admin/users...)
  // is super-admin only; the notifications feed and dashboard are open to all.
  const allowed = (path: string) => {
    if (path.startsWith("/admin/users")) return isSuperAdmin;
    const mod = moduleForPath(path);
    return mod ? canView(mod) : true;
  };

  // Group the menu into labelled sections (like a banking console).
  const SECTION_OF: Record<string, string> = {
    Dashboard: "Overview",
    "Reports & Analytics": "Overview",
    Investors: "People & Money",
    "Investment Products": "People & Money",
    Investments: "People & Money",
    Transactions: "People & Money",
    "Savings Accounts": "People & Money",
    "Member Reports": "People & Money",
    Messages: "Engagement",
    Notifications: "Engagement",
    "Documents Management": "Engagement",
    "Content Management": "Engagement",
    "Admin Users": "System",
    Settings: "System",
  };
  const SECTION_ORDER = ["Overview", "People & Money", "Engagement", "System"];
  const sectionOf = (name: string) => SECTION_OF[name] ?? "System";

  const visibleItems = !loaded
    ? []
    : adminSidebarItems
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((sub) => allowed(sub.path)),
        }))
        .filter((item) =>
          item.subItems ? item.subItems.length > 0 : allowed(item.path)
        )
        .sort(
          (a, b) =>
            SECTION_ORDER.indexOf(sectionOf(a.name)) - SECTION_ORDER.indexOf(sectionOf(b.name))
        );

  return (
    <>
    <SidebarMenu>
      {visibleItems.map((item, index) => {
        const section = sectionOf(item.name);
        const showLabel = index === 0 || sectionOf(visibleItems[index - 1].name) !== section;
        const label = showLabel ? (
          <p
            key={`label-${section}`}
            className={`px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/35 group-data-[collapsible=icon]/sidebar:hidden ${index === 0 ? "pt-0" : "pt-5"}`}
          >
            {section}
          </p>
        ) : null;

        const isSubActive = item.subItems?.some((sub) =>
          pathname.startsWith(sub.path)
        );

        const isMainActive = pathname === item.path;
        const isOpen = isSubActive || isMainActive;

        // ---------------- COLLAPSIBLE MENU ----------------
        if (item.subItems && item.subItems.length > 0) {
          return (
            <React.Fragment key={item.path}>
            {label}
            <Collapsible
              defaultOpen={isOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.name} isActive={isOpen}>
                    {item.icon}
                    <span>{item.name}</span>

                    <ChevronRight
                      className="
                        ml-auto h-4 w-4 transition-transform duration-200
                        group-data-[state=open]/collapsible:rotate-90
                      "
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="group-data-[collapsible=icon]/sidebar:hidden">
                  <ul className="mt-1 space-y-0.5 border-l border-white/15 ml-5 pl-3">
                    {item.subItems.map((sub) => {
                      const isActive = pathname === sub.path;

                      return (
                        <li key={sub.path}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={isActive ? "min-h-8 py-1.5 text-[13px] bg-white/10 text-gold shadow-none before:hidden [&>svg:first-child]:hidden" : "min-h-8 py-1.5 text-[13px] text-sidebar-foreground/65 shadow-none before:hidden hover:bg-white/[0.07] hover:text-white [&>svg:first-child]:hidden"}
                          >
                            <Link href={sub.path} className="flex w-full items-center">
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            </React.Fragment>
          );
        }

        // ---------------- NORMAL MENU ITEM ----------------
        return (
          <React.Fragment key={item.path}>
            {label}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.path}
                tooltip={item.name}
              >
                <Link href={item.path}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </React.Fragment>
        );
      })}
    </SidebarMenu>
    </>
  );
}