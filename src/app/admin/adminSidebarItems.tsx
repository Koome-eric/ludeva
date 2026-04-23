import {
  LayoutDashboard,
  Users,
  Briefcase,
  PieChart,
  ArrowRightLeft,
  Wallet,
  FileText,
  FileStack,
  UserCog,
  Settings,
} from "lucide-react";
import React from "react";

export interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { name: string; path: string }[];
}

export const adminSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    name: "Investors",
    path: "/admin/investors",
    icon: <Users className="h-4 w-4" />,
    subItems: [
      { name: "All Investors", path: "/admin/investors" },
      { name: "KYC Management", path: "/admin/investors/kyc" },
      
    ],
  },
  {
    name: "Investment Products",
    path: "/admin/products",
    icon: <Briefcase className="h-4 w-4" />,
    subItems: [
      { name: "All Products", path: "/admin/products" },
      { name: "MMF", path: "/admin/products/mmf" },
    ],
  },
  {
  name: "Investments",
  path: "/admin/investments",
  icon: <PieChart className="h-4 w-4" />,
  },
  {
    name: "Transactions",
    path: "/admin/transactions",
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },

  {
    name: "Documents Management",
    path: "/admin/documents",
    icon: <FileStack className="h-4 w-4" />,
    
  },

  {
    name: "Messages",
    path: "/admin/chat",
    icon: <FileStack className="h-4 w-4" />,
    
  },
  
  {
    name: "Reports & Analytics",
    path: "/admin/reports",
    icon: <FileText className="h-4 w-4" />,
    
  },
  {
    name: "Content Management",
    path: "/admin/content",
    icon: <FileStack className="h-4 w-4" />,
    
  },
  {
    name: "Admin Users",
    path: "/admin/users",
    icon: <UserCog className="h-4 w-4" />,
    subItems: [
      { name: "All Admins", path: "/admin/users" },
      { name: "Activity", path: "/admin/users/activity" },
      { name: "Notifications", path: "/admin/notifications"},
    ],
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
    
  },
];