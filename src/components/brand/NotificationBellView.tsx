"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, TrendingUp, Wallet, ShieldCheck, Info, CheckCheck, MessageCircle, ArrowUpRight } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

// Presentation-only notification bell + dropdown shared by the member and
// admin top bars. All fetching / socket / read-state logic stays in the
// wrapping components (NotificationsBell, AdminNotificationsBell).

export type BellNotification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  INVESTMENT: TrendingUp,
  PAYMENT: Wallet,
  KYC: ShieldCheck,
  SYSTEM: Info,
  MESSAGE: MessageCircle,
};

const TYPE_TONE: Record<string, string> = {
  INVESTMENT: "bg-success-soft text-success-soft-foreground",
  PAYMENT: "bg-primary/10 text-primary",
  KYC: "bg-warning-soft text-warning-soft-foreground",
  SYSTEM: "bg-muted text-muted-foreground",
  MESSAGE: "bg-accent-soft text-accent-soft-foreground",
};

export function NotificationBellView({
  notifications,
  unreadCount,
  open,
  onToggle,
  onClose,
  wrapperRef,
  onItemClick,
  onMarkAllRead,
  title,
  emptyText,
  viewAllHref,
  viewAllLabel = "View all notifications",
  itemHref,
  limit = 8,
}: {
  notifications: BellNotification[];
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onItemClick: (n: BellNotification) => void;
  onMarkAllRead: () => void;
  title: string;
  emptyText: string;
  viewAllHref: string;
  viewAllLabel?: string;
  /** When set, each row is a link; otherwise a button that only marks as read. */
  itemHref?: string;
  limit?: number;
}) {
  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={onToggle}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:h-10 sm:w-10",
          open && "bg-accent text-foreground"
        )}
      >
        <Bell className="h-[19px] w-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-extrabold leading-none text-gold-foreground ring-2 ring-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-[4.75rem] z-50 w-auto overflow-hidden rounded-2xl border border-border/60 bg-popover text-popover-foreground shadow-lift duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[25rem]"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between gap-3 overflow-hidden bg-brand-gradient px-5 py-4 text-white">
            <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold/25 blur-2xl" />
            <div className="relative flex items-center gap-2.5">
              <h3 className="font-headline text-[15px] font-bold tracking-tight text-white">{title}</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="relative flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[65vh] overflow-y-auto sm:max-h-[24rem]">
            {notifications.length ? (
              notifications.slice(0, limit).map((n) => {
                const kind = n.type || "SYSTEM";
                const Icon = TYPE_ICON[kind] || Info;
                const row = (
                  <>
                    {!n.isRead && <span className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-gold" />}
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TYPE_TONE[kind] || TYPE_TONE.SYSTEM)}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2">
                        <span className={cn("truncate text-[13.5px] leading-tight", n.isRead ? "font-medium" : "font-bold")}>{n.title}</span>
                        {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-muted-foreground">{n.message}</span>
                      <span className="mt-1 block text-[11px] font-medium text-muted-foreground/80">
                        {formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                  </>
                );
                const cls = cn(
                  "relative flex w-full items-start gap-3 border-b border-border/50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-accent/60",
                  !n.isRead && "bg-accent-soft/40"
                );
                return itemHref ? (
                  <Link key={n.id} href={itemHref} className={cls} onClick={() => onItemClick(n)}>
                    {row}
                  </Link>
                ) : (
                  <button key={n.id} type="button" className={cls} onClick={() => onItemClick(n)}>
                    {row}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-gold">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-muted-foreground">{emptyText}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href={viewAllHref}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-muted/40 px-4 py-3 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
          >
            {viewAllLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
