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

  const visibleItems = !loaded
    ? []
    : adminSidebarItems
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((sub) => allowed(sub.path)),
        }))
        .filter((item) =>
          item.subItems ? item.subItems.length > 0 : allowed(item.path)
        );

  return (
    <SidebarMenu>
      {visibleItems.map((item) => {
        const isSubActive = item.subItems?.some((sub) =>
          pathname.startsWith(sub.path)
        );

        const isMainActive = pathname === item.path;
        const isOpen = isSubActive || isMainActive;

        // ---------------- COLLAPSIBLE MENU ----------------
        if (item.subItems && item.subItems.length > 0) {
          return (
            <Collapsible
              key={item.path}
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

                <CollapsibleContent>
                  <ul className="mt-1 space-y-1 border-l border-border/50 ml-5 pl-2">
                    {item.subItems.map((sub) => {
                      const isActive = pathname === sub.path;

                      return (
                        <li key={sub.path}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="h-8 text-sm font-normal"
                          >
                            <Link href={sub.path}>
                              <span>{sub.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        // ---------------- NORMAL MENU ITEM ----------------
        return (
          <SidebarMenuItem key={item.path}>
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
        );
      })}
    </SidebarMenu>
  );
}