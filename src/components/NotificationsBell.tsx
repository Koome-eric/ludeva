"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsBell({
  onUnreadChange,
}: {
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const seenIds = useRef(new Set<string>());
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
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl border bg-background shadow-lg">
          <div className="p-3 border-b font-medium">Notifications</div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.slice(0, 5).map(n => (
                <Link
                  key={n.id}
                  href="/member/notifications"
                  className={cn(
                    "block px-3 py-2 hover:bg-muted transition",
                    !n.isRead && "bg-primary/5"
                  )}
                  onClick={() => {
                    markAsRead(n.id);
                    setOpen(false);
                  }}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {n.message}
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No notifications
              </div>
            )}
          </div>

          <div className="p-2 border-t">
            <Link
              href="/member/notifications"
              className="text-xs text-primary hover:underline"
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