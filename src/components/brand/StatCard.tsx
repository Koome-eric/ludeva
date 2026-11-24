import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./charts";

export type StatTone = "navy" | "gold" | "emerald" | "rose" | "indigo" | "plain";

const TONE: Record<StatTone, string> = {
  navy: "stat-navy",
  gold: "stat-gold",
  emerald: "stat-emerald",
  rose: "stat-rose",
  indigo: "stat-indigo",
  plain: "bg-card text-card-foreground border border-border/60",
};

/**
 * Gradient overview tile: label + icon on top, big figure, optional
 * caption and sparkline. Works in server and client components.
 */
export function StatCard({
  id,
  title,
  value,
  caption,
  icon,
  tone = "navy",
  series,
  badge,
  className,
}: {
  id: string;
  title: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  series?: number[];
  badge?: React.ReactNode;
  className?: string;
}) {
  const plain = tone === "plain";
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        TONE[tone],
        className
      )}
    >
      {/* decorative rings */}
      {!plain && (
        <>
          <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute -bottom-12 right-6 h-24 w-24 rounded-full bg-white/5" />
        </>
      )}
      <div className="relative flex items-start justify-between gap-3">
        <p className={cn("text-sm font-medium", plain ? "text-muted-foreground" : "opacity-80")}>{title}</p>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&_svg]:h-[18px] [&_svg]:w-[18px]",
              plain ? "bg-primary/10 text-primary" : "bg-white/15 backdrop-blur"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-headline text-2xl font-bold tracking-tight sm:text-[1.65rem]">{value}</p>
          {caption && <p className={cn("mt-1 text-xs", plain ? "text-muted-foreground" : "opacity-75")}>{caption}</p>}
        </div>
        {series && series.length > 1 && (
          <Sparkline values={series} id={id} color={plain ? "hsl(var(--gold))" : "rgba(255,255,255,0.9)"} className="h-10 w-20 shrink-0 opacity-90" />
        )}
      </div>
      {badge && <div className="relative mt-3">{badge}</div>}
    </div>
  );
}
