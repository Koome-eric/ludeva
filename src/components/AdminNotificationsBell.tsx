"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell as BellIcon, TrendingUp, Wallet, ShieldCheck, Info, CheckCheck, MessageCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { NotificationBellView } from "@/components/brand/NotificationBellView";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

const typeIcon: Record<string, any> = {
  INVESTMENT: TrendingUp,
  PAYMENT: Wallet,
  KYC: ShieldCheck,
  SYSTEM: Info,
  MESSAGE: MessageCircle,
};

const typeColor: Record<string, string> = {
  INVESTMENT: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
  PAYMENT: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  KYC: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
  SYSTEM: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  MESSAGE: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
};

export function AdminNotificationsBell({
  onUnreadChange,
}: {
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const seenIds = useRef(new Set<string>());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();

      const data: AdminNotification[] = Array.isArray(json)
        ? json
        : Array.isArray(json.notifications)
        ? json.notifications
        : [];

      data.forEach(n => n?.id && seenIds.current.add(n.id));

      setNotifications(data);
      onUnreadChange?.(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Admin notifications fetch error:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );

      onUnreadChange?.(
        notifications.filter(n => n.id !== id && !n.isRead).length
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (!unread.length) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    onUnreadChange?.(0);
    await Promise.all(
      unread.map(n =>
        fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        }).catch(() => {})
      )
    );
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (typeof window !== "undefined" && (window as any).socket) {
      const socket = (window as any).socket;

      const handler = (notification: AdminNotification) => {
        if (!notification?.id) return;
        if (seenIds.current.has(notification.id)) return;

        seenIds.current.add(notification.id);
        setNotifications(prev => {
          const updated = [notification, ...prev];
          onUnreadChange?.(updated.filter(n => !n.isRead).length);
          return updated;
        });

        toast({
          title: "New Activity",
          description: notification.title,
        });
      };

      // ✅ Listen for admin-directed activity
      socket.on("admin:notification:new", handler);

      return () => {
        socket.off("admin:notification:new", handler);
      };
    }

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationBellView
      notifications={notifications}
      unreadCount={unreadCount}
      open={open}
      onToggle={() => setOpen(o => !o)}
      onClose={() => setOpen(false)}
      wrapperRef={wrapperRef}
      onItemClick={n => markAsRead(n.id)}
      onMarkAllRead={markAllAsRead}
      title="Admin Activity"
      emptyText="No admin activity yet"
      viewAllHref="/admin/notifications"
      viewAllLabel="View all activity"
      limit={10}
    />
  );
}
