"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, TrendingUp, Wallet, ShieldCheck, Info, CheckCheck, MessageCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { NotificationBellView } from "@/components/brand/NotificationBellView";

type Notification = {
  id: string;
  title: string;
  message: string;
  type?: "SYSTEM" | "INVESTMENT" | "PAYMENT" | "KYC";
  isRead: boolean;
  createdAt: string;
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

export function NotificationsBell({
  onUnreadChange,
}: {
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const seenIds = useRef(new Set<string>());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ---------------- Initial Fetch ---------------- */

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();

      if (!Array.isArray(data)) return;

      data.forEach(n => n?.id && seenIds.current.add(n.id));

      setNotifications(data);
      onUnreadChange?.(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  /* ---------------- Mark As Read ---------------- */

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );

      onUnreadChange?.(
        notifications.filter(n => n.id !== id && !n.isRead).length
      );
    } catch (err) {
      console.error(err);
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

  /* ---------------- Click outside to close ---------------- */

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------------- Socket.IO ---------------- */

  useEffect(() => {
    fetchNotifications();

    if (typeof window !== "undefined" && (window as any).socket) {
      const socket = (window as any).socket;

      /* join member room */
      const userId = (window as any).currentUserId;
      if (userId) {
        socket.emit("joinRoom", `user:${userId}`);
      }

      const handler = (notification: Notification) => {
        if (!notification?.id) return;

        if (seenIds.current.has(notification.id)) return;

        seenIds.current.add(notification.id);

        setNotifications(prev => {
          const updated = [notification, ...prev];
          onUnreadChange?.(updated.filter(n => !n.isRead).length);
          return updated;
        });

        toast({
          title: "New Notification",
          description: notification.title,
        });
      };

      // ✅ Listen for individual notifications
      socket.on("notification:new", handler);

      // ✅ Listen for broadcast notifications (admin activities)
      socket.on("notification:broadcast", handler);

      return () => {
        socket.off("notification:new", handler);
        socket.off("notification:broadcast", handler);
      };
    }
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <NotificationBellView
      notifications={notifications}
      unreadCount={unreadCount}
      open={open}
      onToggle={() => setOpen(o => !o)}
      onClose={() => setOpen(false)}
      wrapperRef={wrapperRef}
      onItemClick={n => {
        markAsRead(n.id);
        setOpen(false);
      }}
      onMarkAllRead={markAllAsRead}
      title="Notifications"
      emptyText="You're all caught up"
      viewAllHref="/member/notifications"
      itemHref="/member/notifications"
    />
  );
}
