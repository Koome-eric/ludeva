"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, TrendingUp, Wallet, ShieldCheck, Info, CheckCheck } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
};

const typeColor: Record<string, string> = {
  INVESTMENT: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
  PAYMENT: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  KYC: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
  SYSTEM: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
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
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 -m-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed sm:absolute inset-x-3 top-16 sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3
                     w-auto sm:w-[22rem] max-w-full sm:max-w-[calc(100vw-1.5rem)]
                     rounded-2xl border bg-background shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.slice(0, 8).map(n => {
                const Icon = typeIcon[n.type || "SYSTEM"] || Info;
                return (
                  <Link
                    key={n.id}
                    href="/member/notifications"
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0",
                      !n.isRead && "bg-primary/5"
                    )}
                    onClick={() => {
                      markAsRead(n.id);
                      setOpen(false);
                    }}
                  >
                    <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", typeColor[n.type || "SYSTEM"])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm truncate", !n.isRead ? "font-semibold" : "font-medium")}>{n.title}</p>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
                <Bell className="h-6 w-6 opacity-30" />
                No notifications yet
              </div>
            )}
          </div>

          <div className="p-2 border-t">
            <Link
              href="/member/notifications"
              className="block text-center text-xs font-medium text-primary hover:underline py-1"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
