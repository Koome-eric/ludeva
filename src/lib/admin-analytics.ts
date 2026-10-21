/**
 * Live analytics snapshot for the admin dashboard.
 *
 * Source of truth for investment figures is MemberReport (see
 * lib/member-reports.ts) — the same rows and formulas used everywhere else, so
 * the dashboard can never disagree with the Reports / Investments screens.
 * Savings comes from SavingsEntry; member funnel from User / Junior
 * applications; payment health from Payment.
 *
 * Each section loads independently: if one query fails the rest of the
 * dashboard still renders and the failed section is named in `degraded`.
 */

import { prisma } from "@/lib/prisma";
import { parseReportAmount } from "@/lib/member-reports";
import { memberKey } from "@/lib/member-identity";
import {
  buildMonthlySeries,
  buildTopInvestors,
  eatMonthStart,
  pctChange,
  pctOf,
  type ActivityItem,
  type CoreReportRow,
  type DashboardSnapshot,
} from "@/lib/admin-analytics-core";

export type { DashboardSnapshot } from "@/lib/admin-analytics-core";

const PAYMENT_WINDOW_DAYS = 30;
const ACTIVITY_LIMIT = 12;
// Several admins polling every few seconds should cost one set of queries, not N.
const CACHE_TTL_MS = 5_000;

const db = prisma as any;

async function section<T>(name: string, degraded: string[], fallback: T, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (err) {
    console.error(`[admin-analytics] ${name} failed:`, err);
    degraded.push(name);
    return fallback;
  }
}

/* ------------------------------------------------------------------ */

async function buildSnapshot(): Promise<DashboardSnapshot> {
  const now = new Date();
  const degraded: string[] = [];

  const thisMonthStart = eatMonthStart(now, 0);
  const lastMonthStart = eatMonthStart(now, -1);
  const paymentSince = new Date(now.getTime() - PAYMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  /* ---------- Investments (MemberReport) ---------- */
  const reports = await section<{ rows: CoreReportRow[]; uploaded: any[] }>(
    "investments",
    degraded,
    { rows: [], uploaded: [] },
    async () => {
      const raw: any[] = await db.memberReport.findMany({
        select: {
          id: true,
          memberEmail: true,
          memberPhone: true,
          memberName: true,
          accountNo: true,
          date: true,
          principal: true,
          roi: true,
          withdrawal: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
      });
      const rows: CoreReportRow[] = raw.map((r) => ({
        key: memberKey(r),
        name: r.memberName ?? null,
        accountNo: r.accountNo ?? null,
        principal: parseReportAmount(r.principal),
        roi: parseReportAmount(r.roi),
        withdrawal: parseReportAmount(r.withdrawal),
        dateText: r.date ?? null,
        uploadedAt: r.uploadedAt,
      }));
      // `raw` and `rows` share an index; keep raw for ids in the activity feed.
      return { rows, uploaded: raw };
    },
  );

  let totalAUM = 0;
  let totalRoi = 0;
  let totalWithdrawals = 0;
  let depositsThisMonth = 0;
  let depositsLastMonth = 0;
  let withdrawalsThisMonth = 0;
  let withdrawalsLastMonth = 0;
  const memberKeys = new Set<string>();

  for (const r of reports.rows) {
    const p = r.principal ?? 0;
    const w = r.withdrawal ?? 0;
    totalAUM += p;
    totalRoi += r.roi ?? 0;
    totalWithdrawals += w;
    if (r.key) memberKeys.add(r.key);

    // "This month" / "last month" use uploadedAt, matching how the dashboard
    // has always counted monthly deposits: the report `date` column is free
    // text and not reliably dated for withdrawals.
    if (r.uploadedAt >= thisMonthStart) {
      depositsThisMonth += p;
      withdrawalsThisMonth += w;
    } else if (r.uploadedAt >= lastMonthStart) {
      depositsLastMonth += p;
      withdrawalsLastMonth += w;
    }
  }

  const totalInvestors = memberKeys.size;
  const netAUM = totalAUM + totalRoi - totalWithdrawals;
  const topInvestors = buildTopInvestors(reports.rows, totalAUM, 5);
  const top5Principal = topInvestors.reduce((s, t) => s + t.principal, 0);

  /* ---------- Members / KYC funnel ---------- */
  const members = await section(
    "members",
    degraded,
    { registered: 0, newThisMonth: 0, newLastMonth: 0, kycPending: 0, kycApproved: 0, kycRejected: 0, juniorPending: 0 },
    async () => {
      const [registered, newThisMonth, newLastMonth, kycPending, kycApproved, kycRejected, juniorPending] =
        await Promise.all([
          prisma.user.count({ where: { role: "MEMBER" } }),
          prisma.user.count({ where: { role: "MEMBER", createdAt: { gte: thisMonthStart } } }),
          prisma.user.count({ where: { role: "MEMBER", createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
          // Only applicants who actually submitted — an un-onboarded sign-up is not a pending review.
          prisma.user.count({ where: { role: "MEMBER", kycStatus: "PENDING", onboardingCompleted: true } }),
          prisma.user.count({ where: { role: "MEMBER", kycStatus: "APPROVED" } }),
          prisma.user.count({ where: { role: "MEMBER", kycStatus: "REJECTED" } }),
          db.juniorAccountApplication.count({ where: { status: "PENDING_REVIEW" } }),
        ]);
      return { registered, newThisMonth, newLastMonth, kycPending, kycApproved, kycRejected, juniorPending };
    },
  );

  /* ---------- Savings ---------- */
  const savings = await section(
    "savings",
    degraded,
    { savers: 0, totalBalance: 0, totalDeposits: 0, totalWithdrawals: 0, totalInterest: 0 },
    async () => {
      const raw: any[] = await db.savingsEntry.findMany({
        select: {
          memberEmail: true,
          memberPhone: true,
          deposit: true,
          withdrawal: true,
          interestEarned: true,
          closingBalance: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
      });

      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalInterest = 0;
      // Savings rows carry a running balance, so a member's balance is their
      // newest row's closing balance — summing every row would double count.
      const latestBalance = new Map<string, number>();

      for (const r of raw) {
        totalDeposits += parseReportAmount(r.deposit) ?? 0;
        totalWithdrawals += parseReportAmount(r.withdrawal) ?? 0;
        totalInterest += parseReportAmount(r.interestEarned) ?? 0;
        const key = memberKey(r);
        if (!key || latestBalance.has(key)) continue;
        const closing = parseReportAmount(r.closingBalance);
        if (closing !== null) latestBalance.set(key, closing);
      }

      let totalBalance = 0;
      for (const v of latestBalance.values()) totalBalance += v;
      return { savers: latestBalance.size, totalBalance, totalDeposits, totalWithdrawals, totalInterest };
    },
  );

  /* ---------- Payments (last 30 days) ---------- */
  const paymentData = await section<{ rows: any[] }>("payments", degraded, { rows: [] }, async () => {
    const rows: any[] = await db.payment.findMany({
      where: { createdAt: { gte: paymentSince } },
      select: { id: true, amount: true, method: true, status: true, createdAt: true, user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { rows };
  });

  let paySuccess = 0;
  let payFailed = 0;
  let payPending = 0;
  let paySuccessVolume = 0;
  for (const p of paymentData.rows) {
    if (p.status === "SUCCESS") {
      paySuccess++;
      paySuccessVolume += Number(p.amount) || 0;
    } else if (p.status === "FAILED") {
      payFailed++;
    } else {
      payPending++;
    }
  }
  const payments = {
    windowDays: PAYMENT_WINDOW_DAYS,
    total: paymentData.rows.length,
    success: paySuccess,
    failed: payFailed,
    pending: payPending,
    successVolume: paySuccessVolume,
    successRatePct: paySuccess + payFailed > 0 ? pctOf(paySuccess, paySuccess + payFailed) : null,
  };

  /* ---------- Activity feed ---------- */
  const activity = await section<ActivityItem[]>("activity", degraded, [], async () => {
    const items: ActivityItem[] = [];

    // Newest sheet / admin-entry rows (reports.rows is already newest-first).
    reports.rows.slice(0, 10).forEach((r, i) => {
      const who = r.name || r.key || "Unknown member";
      const id = `report:${reports.uploaded[i]?.id ?? i}`;
      const at = r.uploadedAt.toISOString();
      if ((r.principal ?? 0) > 0) {
        items.push({ id, kind: "deposit", title: `Deposit recorded — ${who}`, detail: r.accountNo, amount: r.principal, at });
      } else if ((r.withdrawal ?? 0) > 0) {
        items.push({ id, kind: "withdrawal", title: `Withdrawal recorded — ${who}`, detail: r.accountNo, amount: r.withdrawal, at });
      } else if ((r.roi ?? 0) !== 0) {
        items.push({ id, kind: "roi", title: `ROI posted — ${who}`, detail: r.accountNo, amount: r.roi, at });
      }
    });

    const [newUsers, kycUsers, juniors]: [any[], any[], any[]] = await Promise.all([
      prisma.user.findMany({
        where: { role: "MEMBER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, email: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { role: "MEMBER", kycStatus: "PENDING", kycSubmittedAt: { not: null } },
        orderBy: { kycSubmittedAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, email: true, kycSubmittedAt: true },
      }),
      db.juniorAccountApplication.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, childFullName: true, status: true, createdAt: true },
      }),
    ]);

    for (const u of newUsers) {
      items.push({ id: `signup:${u.id}`, kind: "signup", title: `New member — ${u.fullName || u.email}`, detail: null, amount: null, at: u.createdAt.toISOString() });
    }
    for (const u of kycUsers) {
      items.push({ id: `kyc:${u.id}`, kind: "kyc_submitted", title: `KYC submitted — ${u.fullName || u.email}`, detail: "Awaiting review", amount: null, at: u.kycSubmittedAt.toISOString() });
    }
    for (const j of juniors) {
      items.push({ id: `junior:${j.id}`, kind: "junior_application", title: `Junior account application — ${j.childFullName}`, detail: j.status === "PENDING_REVIEW" ? "Awaiting review" : String(j.status).toLowerCase(), amount: null, at: j.createdAt.toISOString() });
    }
    for (const p of paymentData.rows.slice(0, 5)) {
      if (p.status !== "SUCCESS" && p.status !== "FAILED") continue;
      const who = p.user?.fullName || p.user?.email || "a member";
      items.push({
        id: `payment:${p.id}`,
        kind: p.status === "SUCCESS" ? "payment_success" : "payment_failed",
        title: `${p.method === "MPESA" ? "M-Pesa" : "Card"} payment ${p.status === "SUCCESS" ? "received" : "failed"} — ${who}`,
        detail: null,
        amount: Number(p.amount) || null,
        at: p.createdAt.toISOString(),
      });
    }

    return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, ACTIVITY_LIMIT);
  });

  return {
    generatedAt: now.toISOString(),
    degraded,
    kpis: {
      totalAUM,
      netAUM,
      totalRoi,
      totalWithdrawals,
      totalInvestors,
      avgPerInvestor: totalInvestors > 0 ? totalAUM / totalInvestors : 0,
      roiYieldPct: pctOf(totalRoi, totalAUM),
      outflowPct: pctOf(totalWithdrawals, totalAUM),
      top5SharePct: pctOf(top5Principal, totalAUM),
      depositsThisMonth,
      depositsLastMonth,
      depositsMomPct: pctChange(depositsThisMonth, depositsLastMonth),
      withdrawalsThisMonth,
      withdrawalsLastMonth,
    },
    members,
    savings,
    payments,
    series: buildMonthlySeries(reports.rows, now, 12),
    topInvestors,
    activity,
  };
}

/* ------------------------------------------------------------------ */
/* Cached entry point                                                   */
/* ------------------------------------------------------------------ */

const g = globalThis as typeof globalThis & {
  __adminDashSnapshot?: { at: number; value?: DashboardSnapshot; inflight?: Promise<DashboardSnapshot> };
};

/**
 * Returns a snapshot no older than CACHE_TTL_MS. Concurrent callers share one
 * in-flight computation, so N admins on the dashboard cost one set of queries.
 */
export async function getAdminDashboardSnapshot(): Promise<DashboardSnapshot> {
  const cache = (g.__adminDashSnapshot ??= { at: 0 });
  const now = Date.now();

  if (cache.value && now - cache.at < CACHE_TTL_MS) return cache.value;
  if (cache.inflight) return cache.inflight;

  cache.inflight = buildSnapshot()
    .then((value) => {
      cache.value = value;
      cache.at = Date.now();
      return value;
    })
    .finally(() => {
      cache.inflight = undefined;
    });

  return cache.inflight;
}
