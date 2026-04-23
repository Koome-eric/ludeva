"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell as BellIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

export function AdminNotificationsBell({
  onUnreadChange,
}: {
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const seenIds = useRef(new Set<string>());
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
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

  useEffect(() => {
    fetchNotifications();

    if (typeof window !== "undefined" && (window as any).socket) {
      const socket = (window as any).socket;

      // ✅ Join the admin room (hard-coded super admin)
      const SUPER_ADMIN_CLERK_ID = "user_38qCNW1RIEGrQ6rORph6s2348NX";
      socket.emit("joinRoom", `admin:${SUPER_ADMIN_CLERK_ID}`);

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
          title: "New Member Activity",
          description: notification.title,
        });
      };

      socket.on("admin:notification:new", handler);
      return () => socket.off("admin:notification:new", handler);
    }

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <BellIcon className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 rounded-xl border bg-background shadow-lg z-50">
          <div className="p-3 border-b font-medium">Member Activities</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className={cn(
                    "px-3 py-2 hover:bg-muted transition cursor-pointer",
                    !n.isRead && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No member activity yet.
              </div>
            )}
          </div>
          <div className="p-2 border-t text-right">
            <Link
              href="/admin/notifications"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}