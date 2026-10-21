/**
 * Pure calculation helpers for the admin dashboard analytics.
 *
 * Deliberately has NO imports (no prisma, no path aliases) so it can be unit
 * tested directly with `node --test`. The server layer (admin-analytics.ts)
 * parses the raw MemberReport strings with parseReportAmount and hands numbers
 * in here, so there is still exactly one amount-parsing rule in the app.
 */

// East Africa Time is UTC+3 with no DST, so a fixed offset is safe.
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Snapshot types (shared by the API route and the client component)   */
/* ------------------------------------------------------------------ */

export interface MonthPoint {
  /** "2026-10" */
  key: string;
  /** "Oct 26" */
  label: string;
  deposits: number;
  roi: number;
  withdrawals: number;
  /** Cumulative principal at the end of this month (AUM growth curve). */
  cumulativeAum: number;
}

export interface TopInvestor {
  key: string;
  name: string;
  accountNo: string | null;
  principal: number;
  roi: number;
  withdrawals: number;
  net: number;
  /** Share of total platform AUM, 0–100. */
  sharePct: number;
}

export type ActivityKind =
  | "deposit"
  | "withdrawal"
  | "roi"
  | "signup"
  | "kyc_submitted"
  | "junior_application"
  | "payment_success"
  | "payment_failed";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string | null;
  amount: number | null;
  /** ISO timestamp */
  at: string;
}

export interface DashboardSnapshot {
  generatedAt: string;
  /** Names of data sections that failed to load; the rest still render. */
  degraded: string[];
  kpis: {
    totalAUM: number;
    netAUM: number;
    totalRoi: number;
    totalWithdrawals: number;
    totalInvestors: number;
    avgPerInvestor: number;
    /** ROI as % of AUM. */
    roiYieldPct: number;
    /** Withdrawals as % of AUM. */
    outflowPct: number;
    /** Top-5 investors' share of AUM, 0–100. */
    top5SharePct: number;
    depositsThisMonth: number;
    depositsLastMonth: number;
    /** null when last month was zero (no meaningful base). */
    depositsMomPct: number | null;
    withdrawalsThisMonth: number;
    withdrawalsLastMonth: number;
  };
  members: {
    registered: number;
    newThisMonth: number;
    newLastMonth: number;
    kycPending: number;
    kycApproved: number;
    kycRejected: number;
    juniorPending: number;
  };
  savings: {
    savers: number;
    totalBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalInterest: number;
  };
  payments: {
    windowDays: number;
    total: number;
    success: number;
    failed: number;
    pending: number;
    successVolume: number;
    /** success / (success + failed) as %, null when nothing has settled. */
    successRatePct: number | null;
  };
  series: MonthPoint[];
  topInvestors: TopInvestor[];
  activity: ActivityItem[];
}

/* ------------------------------------------------------------------ */
/* Dates                                                                */
/* ------------------------------------------------------------------ */

export interface YearMonth {
  y: number;
  /** 1–12 */
  m: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function validYm(y: number, m: number): boolean {
  return y >= 2000 && y <= 2100 && m >= 1 && m <= 12;
}

/**
 * Parses the free-text `date` column of a report row into a calendar
 * year/month. Returns null when it can't be read with confidence, so the
 * caller can fall back to the upload date instead of guessing.
 *
 * Slash/dash/dot dates follow the app's MM/DD/YYYY convention, except when one
 * part can only be a day (>12), in which case DD/MM is unambiguous.
 */
export function parseReportYearMonth(text?: string | null): YearMonth | null {
  if (!text) return null;
  const s = text.trim();
  if (!s) return null;

  // ISO: 2026-10-03 or 2026-10-03T08:00:00Z
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    return validYm(y, m) ? { y, m } : null;
  }

  // 03/10/2026, 3-10-26, 3.10.2026
  const num = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
  if (num) {
    const a = Number(num[1]);
    const b = Number(num[2]);
    let y = Number(num[3]);
    if (num[3].length === 2) y += 2000;
    // a is the month unless it can only be a day (then b is the month).
    const m = a > 12 ? b : a;
    return validYm(y, m) ? { y, m } : null;
  }

  // Textual dates ("Nov 3, 2025", "3 November 2025") — require an explicit year
  // so labels like "Q1" or "Week 3" never turn into a bogus date.
  if (/\b(19|20)\d{2}\b/.test(s)) {
    const t = Date.parse(s);
    if (!Number.isNaN(t)) {
      const d = new Date(t);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return validYm(y, m) ? { y, m } : null;
    }
  }

  return null;
}

/** Calendar year/month of an instant, as seen in Nairobi. */
export function eatYearMonth(d: Date): YearMonth {
  const shifted = new Date(d.getTime() + EAT_OFFSET_MS);
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1 };
}

/**
 * The instant the given Nairobi calendar month started. `monthOffset` of 0 is
 * the current month, -1 the previous one, and so on.
 */
export function eatMonthStart(now: Date, monthOffset = 0): Date {
  const { y, m } = eatYearMonth(now);
  return new Date(Date.UTC(y, m - 1 + monthOffset, 1) - EAT_OFFSET_MS);
}

export function ymKey({ y, m }: YearMonth): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}

function shiftYm({ y, m }: YearMonth, by: number): YearMonth {
  const idx = y * 12 + (m - 1) + by;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

/* ------------------------------------------------------------------ */
/* Row-based aggregates                                                 */
/* ------------------------------------------------------------------ */

export interface CoreReportRow {
  /** memberKey(): email, else phone. Empty when the row has neither. */
  key: string;
  name: string | null;
  accountNo: string | null;
  principal: number | null;
  roi: number | null;
  withdrawal: number | null;
  /** Free-text DATE column from the sheet. */
  dateText: string | null;
  uploadedAt: Date;
}

/** Month a row belongs to: its own report date, else when it was uploaded. */
export function rowYearMonth(row: Pick<CoreReportRow, "dateText" | "uploadedAt">): YearMonth {
  return parseReportYearMonth(row.dateText) ?? eatYearMonth(row.uploadedAt);
}

/**
 * Last `months` calendar months (oldest first, ending with the current month)
 * of deposits / ROI / withdrawals plus the running AUM curve.
 *
 * Rows dated before the window feed the opening AUM; rows dated after the
 * current month (a typo'd or future date) are ignored rather than distorting
 * the curve.
 */
export function buildMonthlySeries(rows: CoreReportRow[], now: Date, months = 12): MonthPoint[] {
  const current = eatYearMonth(now);
  const first = shiftYm(current, -(months - 1));
  const firstIdx = first.y * 12 + (first.m - 1);
  const currentIdx = current.y * 12 + (current.m - 1);

  const points: MonthPoint[] = [];
  for (let i = 0; i < months; i++) {
    const ym = shiftYm(first, i);
    points.push({
      key: ymKey(ym),
      label: `${MONTH_LABELS[ym.m - 1]} ${String(ym.y).slice(2)}`,
      deposits: 0,
      roi: 0,
      withdrawals: 0,
      cumulativeAum: 0,
    });
  }

  let openingAum = 0;
  for (const row of rows) {
    const ym = rowYearMonth(row);
    const idx = ym.y * 12 + (ym.m - 1);
    if (idx > currentIdx) continue;
    if (idx < firstIdx) {
      openingAum += row.principal ?? 0;
      continue;
    }
    const p = points[idx - firstIdx];
    p.deposits += row.principal ?? 0;
    p.roi += row.roi ?? 0;
    p.withdrawals += row.withdrawal ?? 0;
  }

  let running = openingAum;
  for (const p of points) {
    running += p.deposits;
    p.cumulativeAum = running;
  }
  return points;
}

/** Investors ranked by cumulative principal, with their share of total AUM. */
export function buildTopInvestors(rows: CoreReportRow[], totalAUM: number, n = 5): TopInvestor[] {
  const byMember = new Map<string, TopInvestor>();

  for (const row of rows) {
    if (!row.key) continue;
    const entry =
      byMember.get(row.key) ??
      ({
        key: row.key,
        name: row.name || row.key,
        accountNo: row.accountNo,
        principal: 0,
        roi: 0,
        withdrawals: 0,
        net: 0,
        sharePct: 0,
      } satisfies TopInvestor);
    if (!entry.name || entry.name === entry.key) entry.name = row.name || entry.name;
    if (!entry.accountNo && row.accountNo) entry.accountNo = row.accountNo;
    entry.principal += row.principal ?? 0;
    entry.roi += row.roi ?? 0;
    entry.withdrawals += row.withdrawal ?? 0;
    byMember.set(row.key, entry);
  }

  return [...byMember.values()]
    .map((e) => ({
      ...e,
      net: e.principal + e.roi - e.withdrawals,
      sharePct: totalAUM > 0 ? (e.principal / totalAUM) * 100 : 0,
    }))
    .sort((a, b) => b.principal - a.principal)
    .slice(0, n);
}

/** Percentage change, or null when there is no base to compare against. */
export function pctChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Safe percentage: part / whole × 100, 0 when whole is 0. */
export function pctOf(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}
