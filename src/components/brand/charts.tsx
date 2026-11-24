// Dependency-free, server-renderable SVG charts for the dashboards.

function buildPoints(values: number[], w: number, h: number, padY = 6) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = padY + (1 - (v - min) / span) * (h - padY * 2);
    return [x, y] as const;
  });
}

// Smooth (monotone-ish) path through points.
function smoothPath(pts: ReadonlyArray<readonly [number, number]>) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M0 ${pts[0][1]} L${pts[0][0] * 2} ${pts[0][1]}`;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

/** Tiny trend line for stat tiles. `color` is any CSS colour. */
export function Sparkline({
  values,
  id,
  color = "currentColor",
  className,
}: {
  values: number[];
  id: string;
  color?: string;
  className?: string;
}) {
  if (!values || values.length < 2) return null;
  const w = 120;
  const h = 40;
  const pts = buildPoints(values, w, h);
  const line = smoothPath(pts);
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Larger area chart with light grid and an end-point marker. */
export function AreaChart({
  values,
  labels,
  id,
  className,
  format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 }),
}: {
  values: number[];
  labels?: string[];
  id: string;
  className?: string;
  format?: (n: number) => string;
}) {
  if (!values || values.length < 2) return null;
  const w = 600;
  const h = 220;
  const pts = buildPoints(values, w, h, 16);
  const line = smoothPath(pts);
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className={className}>
      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none" role="img" aria-label="Balance over time">
          <defs>
            <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="hsl(var(--border))" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill={`url(#area-${id})`} />
          <path d={line} fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* end marker positioned in % so it isn't distorted by preserveAspectRatio="none" */}
        <span
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-gold shadow-glow"
          style={{ left: `${(last[0] / w) * 100}%`, top: `${(last[1] / h) * 100}%` }}
        />
        <div className="pointer-events-none absolute left-0 top-0 text-[11px] font-medium text-muted-foreground">{format(max)}</div>
        <div className="pointer-events-none absolute bottom-0 left-0 text-[11px] font-medium text-muted-foreground">{format(min)}</div>
      </div>
      {labels && labels.length > 1 && (
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>{labels[0]}</span>
          {labels.length > 2 && <span>{labels[Math.floor(labels.length / 2)]}</span>}
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}
