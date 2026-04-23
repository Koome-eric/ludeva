import { LayoutDashboard, Users } from "lucide-react";
import React from "react";

export const adminSidebarItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    name: "Investors",
    path: "/admin/investors",
    icon: <Users className="h-4 w-4" />,
  },
];