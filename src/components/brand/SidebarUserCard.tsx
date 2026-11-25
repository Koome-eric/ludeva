import * as React from "react";

/** Compact account card for the bottom of the navy sidebar. */
export function SidebarUserCard({
  name,
  subtitle,
  imageUrl,
  children,
}: {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  children?: React.ReactNode;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "L";

  return (
    <div className="m-3 mt-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-gold/60" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient font-headline text-sm font-extrabold shadow-glow">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-white">{name}</p>
          {subtitle && <p className="truncate text-xs text-sidebar-foreground/55">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
