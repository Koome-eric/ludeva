"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  FileClock,
  PiggyBank,
  RefreshCw,
  Scale,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ActivityKind, DashboardSnapshot } from "@/lib/admin-analytics-core";

/* ------------------------------------------------------------------ */
/* Formatting                                                           */
/* ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

const kes = (n: number) => `KES ${nf.format(Math.round(n))}`;
const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

/* ------------------------------------------------------------------ */
/* Live polling                                                         */
/* ------------------------------------------------------------------ */

type LiveStatus = "live" | "refreshing" | "error" | "paused";

const POLL_MS = 15_000;
const MAX_BACKOFF_MULTIPLIER = 4;

function useLiveSnapshot(initial: DashboardSnapshot) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<LiveStatus>("live");
  const [lastOkAt, setLastOkAt] = useState(() => Date.parse(initial.generatedAt));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const failures = useRef(0);
  const inflight = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadRef = useRef<() => Promise<void>>(async () => {});

  const load = useCallback(async () => {
    if (inflight.current) return; // never overlap requests
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setStatus("refreshing");
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store", signal: ctrl.signal });
      if (res.status === 401 || res.status === 403) {
        throw new Error("Your admin session has expired — sign in again.");
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const next: DashboardSnapshot = await res.json();
      setData(next);
      setLastOkAt(Date.now());
      setErrorMsg(null);
      setStatus("live");
      failures.current = 0;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      failures.current += 1;
      setErrorMsg((err as Error).message || "Connection problem");
      setStatus("error");
    } finally {
      inflight.current = null;
    }
  }, []);

  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      if (cancelled || document.hidden) return;
      const multiplier = Math.min(MAX_BACKOFF_MULTIPLIER, failures.current + 1);
      timer.current = setTimeout(tick, POLL_MS * multiplier);
    };

    const tick = async () => {
      if (cancelled) return;
      await loadRef.current();
      schedule();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timer.current) clearTimeout(timer.current);
        setStatus("paused");
      } else {
        // Coming back to the tab: catch up immediately instead of waiting out the interval.
        void tick();
      }
    };
    const onOnline = () => void tick();

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      inflight.current?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const refreshNow = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await loadRef.current();
    // Resume the cadence after a manual refresh.
    if (!document.hidden) timer.current = setTimeout(() => void loadRef.current(), POLL_MS);
  }, []);

  return { data, status, lastOkAt, errorMsg, refreshNow };
}

/** Briefly true after `value` changes, so updated figures visibly pulse. */
function useFlash(value: string | number) {
  const prev = useRef(value);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setOn(true);
    const t = setTimeout(() => setOn(false), 1400);
    return () => clearTimeout(t);
  }, [value]);
  return on;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

function LiveBadge({
  status,
  lastOkAt,
  errorMsg,
  onRefresh,
}: {
  status: LiveStatus;
  lastOkAt: number;
  errorMsg: string | null;
  onRefresh: () => void;
}) {
  // Own 1s ticker so only this badge re-renders every second, not the whole dashboard.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = Math.max(0, Math.round((Date.now() - lastOkAt) / 1000));
  const ago = secs < 5 ? "just now" : secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`;

  const dot =
    status === "error" ? "bg-amber-500" : status === "paused" ? "bg-muted-foreground/50" : "bg-emerald-500";
  const label =
    status === "error" ? "Reconnecting…" : status === "paused" ? "Paused (tab hidden)" : "Live";

  return (
    <div className="flex items-center gap-3 self-start sm:self-auto" role="status">
      <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs">
        <span className="relative flex h-2 w-2">
          {status !== "paused" && status !== "error" && (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dot)} />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", dot)} />
        </span>
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">· updated {ago}</span>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={status === "refreshing"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        aria-label="Refresh now"
        title={errorMsg ?? "Refresh now"}
      >
        <RefreshCw className={cn("h-4 w-4", status === "refreshing" && "animate-spin")} />
      </button>
    </div>
  );
}

function Delta({ value, goodWhenUp = true, suffix = "vs last month" }: { value: number | null; goodWhenUp?: boolean; suffix?: string }) {
  if (value === null) return null;
  const up = value >= 0;
  const good = up === goodWhenUp;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-emerald-600" : "text-red-600")}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
      <span className="ml-1 font-normal text-muted-foreground">{suffix}</span>
    </span>
  );
}

function KpiCard({
  title,
  icon: Icon,
  iconClass,
  value,
  sub,
}: {
  title: string;
  icon: LucideIcon;
  iconClass?: string;
  value: string;
  sub: React.ReactNode;
}) {
  const flash = useFlash(value);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", iconClass)} />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "-mx-1 w-fit rounded px-1 text-2xl font-bold tabular-nums transition-colors duration-700 xl:text-3xl",
            flash && "bg-emerald-500/20",
          )}
        >
          {value}
        </div>
        <p className="pt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function TimeAgo({ iso }: { iso: string }) {
  // Computed after mount: server and browser disagree on "now" and timezone.
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => setText(formatDistanceToNowStrict(new Date(iso), { addSuffix: true }));
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [iso]);
  return <span suppressHydrationWarning>{text}</span>;
}

const ACTIVITY_STYLE: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  deposit: { icon: ArrowUp, tone: "bg-emerald-500/15 text-emerald-600" },
  withdrawal: { icon: ArrowDown, tone: "bg-red-500/15 text-red-600" },
  roi: { icon: TrendingUp, tone: "bg-sky-500/15 text-sky-600" },
  signup: { icon: UserPlus, tone: "bg-violet-500/15 text-violet-600" },
  kyc_submitted: { icon: FileClock, tone: "bg-amber-500/15 text-amber-600" },
  junior_application: { icon: FileClock, tone: "bg-amber-500/15 text-amber-600" },
  payment_success: { icon: CreditCard, tone: "bg-emerald-500/15 text-emerald-600" },
  payment_failed: { icon: XCircle, tone: "bg-red-500/15 text-red-600" },
};

/* ------------------------------------------------------------------ */
/* Chart configs                                                        */
/* ------------------------------------------------------------------ */

const cashflowConfig = {
  deposits: { label: "Deposits", color: "#10b981" },
  withdrawals: { label: "Withdrawals", color: "#f43f5e" },
  roi: { label: "ROI", color: "#0ea5e9" },
} satisfies ChartConfig;

const aumConfig = {
  cumulativeAum: { label: "Cumulative AUM", color: "#10b981" },
} satisfies ChartConfig;

function moneyTooltip(config: ChartConfig) {
  return (
    <ChartTooltipContent
      formatter={(value, name) => (
        <div className="flex w-full items-center justify-between gap-6">
          <span className="text-muted-foreground">{config[String(name)]?.label ?? name}</span>
          <span className="font-mono font-medium tabular-nums">{kes(Number(value))}</span>
        </div>
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export default function AdminDashboardLive({ initial }: { initial: DashboardSnapshot }) {
  const { data, status, lastOkAt, errorMsg, refreshNow } = useLiveSnapshot(initial);
  const { kpis, members, savings, payments, series, topInvestors, activity } = data;

  const hasFlow = series.some((p) => p.deposits || p.withdrawals || p.roi);
  const kycTotal = members.kycApproved + members.kycPending + members.kycRejected;
  const kycRows = [
    { label: "Approved", value: members.kycApproved, bar: "bg-emerald-500" },
    { label: "Pending review", value: members.kycPending, bar: "bg-amber-500" },
    { label: "Rejected", value: members.kycRejected, bar: "bg-red-500" },
  ];
  const payTotal = payments.success + payments.failed + payments.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and investor management.</p>
        </div>
        <LiveBadge status={status} lastOkAt={lastOkAt} errorMsg={errorMsg} onRefresh={refreshNow} />
      </div>

      {status === "error" && errorMsg && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg} Showing the last figures received; retrying automatically.</span>
        </div>
      )}
      {data.degraded.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Couldn&apos;t load: {data.degraded.join(", ")}. Those sections show zeros until the next successful refresh.
          </span>
        </div>
      )}

      {/* KPIs — first row keeps the original four headline cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total AUM"
          icon={CircleDollarSign}
          value={kes(kpis.totalAUM)}
          sub="Cumulative principal deposited by all members"
        />
        <KpiCard
          title="Total Investors"
          icon={Users}
          value={nf.format(kpis.totalInvestors)}
          sub={`${nf.format(members.registered)} registered · +${nf.format(members.newThisMonth)} sign-ups this month`}
        />
        <KpiCard
          title="Deposits This Month"
          icon={ArrowUp}
          iconClass="text-green-500"
          value={kes(kpis.depositsThisMonth)}
          sub={
            kpis.depositsMomPct !== null ? (
              <Delta value={kpis.depositsMomPct} />
            ) : (
              `Last month: ${kes(kpis.depositsLastMonth)}`
            )
          }
        />
        <KpiCard
          title="Withdrawals This Month"
          icon={ArrowDown}
          iconClass="text-red-500"
          value={kes(kpis.withdrawalsThisMonth)}
          sub={`All time: ${kes(kpis.totalWithdrawals)} (${pct(kpis.outflowPct)} of AUM)`}
        />
        <KpiCard
          title="Net AUM"
          icon={Scale}
          value={kes(kpis.netAUM)}
          sub="AUM + ROI − withdrawals"
        />
        <KpiCard
          title="Total ROI"
          icon={TrendingUp}
          iconClass="text-sky-500"
          value={kes(kpis.totalRoi)}
          sub={`${pct(kpis.roiYieldPct)} yield on AUM`}
        />
        <KpiCard
          title="Avg. per Investor"
          icon={BadgeCheck}
          value={kes(kpis.avgPerInvestor)}
          sub={`Top 5 investors hold ${pct(kpis.top5SharePct, 0)} of AUM`}
        />
        <KpiCard
          title="Savings Balance"
          icon={PiggyBank}
          value={kes(savings.totalBalance)}
          sub={`${nf.format(savings.savers)} savers · ${kes(savings.totalInterest)} interest earned`}
        />
      </div>

      {/* Cash flow + KYC funnel */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash flow — last 12 months</CardTitle>
            <CardDescription>Deposits and withdrawals by report month, with ROI posted.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasFlow ? (
              <ChartContainer config={cashflowConfig} className="h-[280px] w-full">
                <ComposedChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    fontSize={12}
                    tickFormatter={(v) => compact.format(Number(v))}
                  />
                  <ChartTooltip content={moneyTooltip(cashflowConfig)} />
                  <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
                  <Line dataKey="roi" type="monotone" stroke="var(--color-roi)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No deposit activity recorded yet.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {(Object.keys(cashflowConfig) as (keyof typeof cashflowConfig)[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: cashflowConfig[k].color }} />
                  {cashflowConfig[k].label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding &amp; KYC</CardTitle>
            <CardDescription>{nf.format(kycTotal)} members by verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kycRows.map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{r.label}</span>
                  <span className="font-medium tabular-nums">{nf.format(r.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", r.bar)}
                    style={{ width: `${kycTotal ? (r.value / kycTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="space-y-2 border-t pt-4">
              <Link
                href="/admin/investors/kyc"
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <span>KYC awaiting review</span>
                <span className="flex items-center gap-1 font-semibold">
                  {nf.format(members.kycPending)}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </Link>
              <Link
                href="/admin/investors/junior-accounts"
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <span>Junior applications pending</span>
                <span className="flex items-center gap-1 font-semibold">
                  {nf.format(members.juniorPending)}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </Link>
              <p className="pt-1 text-xs text-muted-foreground">
                {nf.format(members.newThisMonth)} new sign-ups this month vs {nf.format(members.newLastMonth)} last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AUM growth + payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AUM growth</CardTitle>
            <CardDescription>Cumulative principal at the end of each month.</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.totalAUM > 0 ? (
              <ChartContainer config={aumConfig} className="h-[240px] w-full">
                <AreaChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="aumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cumulativeAum)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-cumulativeAum)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    fontSize={12}
                    tickFormatter={(v) => compact.format(Number(v))}
                  />
                  <ChartTooltip content={moneyTooltip(aumConfig)} />
                  <Area
                    dataKey="cumulativeAum"
                    type="monotone"
                    stroke="var(--color-cumulativeAum)"
                    strokeWidth={2}
                    fill="url(#aumFill)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No AUM recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment health</CardTitle>
            <CardDescription>M-Pesa &amp; card, last {payments.windowDays} days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <PaymentRate rate={payments.successRatePct} />
              <p className="text-xs text-muted-foreground">
                success rate of settled payments · {kes(payments.successVolume)} collected
              </p>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
              {payTotal > 0 && (
                <>
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(payments.success / payTotal) * 100}%` }} />
                  <div className="bg-amber-500 transition-all duration-700" style={{ width: `${(payments.pending / payTotal) * 100}%` }} />
                  <div className="bg-red-500 transition-all duration-700" style={{ width: `${(payments.failed / payTotal) * 100}%` }} />
                </>
              )}
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Successful</dt>
                <dd className="font-semibold tabular-nums">{nf.format(payments.success)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pending</dt>
                <dd className="font-semibold tabular-nums">{nf.format(payments.pending)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Failed</dt>
                <dd className="font-semibold tabular-nums">{nf.format(payments.failed)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Top investors + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top investors</CardTitle>
            <CardDescription>Ranked by cumulative principal, with share of total AUM.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="hidden text-right md:table-cell">ROI</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Withdrawn</TableHead>
                  <TableHead className="w-[130px]">Share of AUM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topInvestors.length ? (
                  topInvestors.map((t) => (
                    <TableRow key={t.key}>
                      <TableCell>
                        <div className="font-medium">{t.name}</div>
                        {t.accountNo && <div className="text-xs text-muted-foreground">{t.accountNo}</div>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{kes(t.principal)}</TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">{kes(t.roi)}</TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">{kes(t.withdrawals)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, t.sharePct)}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs tabular-nums">{pct(t.sharePct)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No investor data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest deposits, sign-ups, KYC and payments.</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length ? (
              <ul className="space-y-4">
                {activity.map((a) => {
                  const { icon: Icon, tone } = ACTIVITY_STYLE[a.kind];
                  return (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", tone)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.amount !== null && <span className="font-medium text-foreground">{kes(a.amount)} · </span>}
                          {a.detail && <span>{a.detail} · </span>}
                          <TimeAgo iso={a.at} />
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PaymentRate({ rate }: { rate: number | null }) {
  const text = rate === null ? "—" : pct(rate);
  const flash = useFlash(text);
  const tone = rate === null ? "" : rate >= 95 ? "text-emerald-600" : rate >= 80 ? "text-amber-600" : "text-red-600";
  return (
    <div
      className={cn(
        "-mx-1 w-fit rounded px-1 text-3xl font-bold tabular-nums transition-colors duration-700",
        tone,
        flash && "bg-emerald-500/20",
      )}
    >
      {text}
    </div>
  );
}
