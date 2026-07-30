"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, TrendingUp, Wallet, ShieldCheck, Info, CheckCheck, Loader2 } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
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

export default function NotificationsPageClient({
  endpoint,
  subtitle,
}: {
  endpoint: string;
  subtitle: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [endpoint]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.all(
      unread.map((n) =>
        fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        }).catch(() => {})
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = filter === "UNREAD" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["ALL", "UNREAD"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f === "ALL" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications…
            </div>
          ) : visible.length ? (
            <div className="divide-y">
              {visible.map((n) => {
                const Icon = typeIcon[n.type] || Info;
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-muted/40 transition-colors",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className={cn("flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center", typeColor[n.type] || typeColor.SYSTEM)}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm sm:text-[15px] break-words", !n.isRead ? "font-semibold" : "font-medium")}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-words">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}
                        <span className="hidden sm:inline"> · {format(new Date(n.createdAt), "dd MMM yyyy, HH:mm")}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">{filter === "UNREAD" ? "You're all caught up." : "No notifications yet."}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
