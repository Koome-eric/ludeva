// src/app/api/reports/analytics/route.ts
//
// Rebuilt to source from MemberReport — the single source of truth for
// investment figures across the rest of the app (see lib/member-reports.ts).
// The previous version of this endpoint read from the legacy Transaction/
// Investment models (an old product-purchase flow that isn't how deposits
// are actually tracked), and even then had a real bug: it summed
// transaction.amount regardless of type, so withdrawals inflated the
// "Portfolio Growth" figure instead of reducing it. It also included a
// "Fees" report built from a fabricated 1% placeholder figure that isn't
// a real fee structure. None of that is reused here.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReportAmount, getPlatformAumSummary } from "@/lib/member-reports";
import { requireAdminApi } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;

    const reports = await (prisma as any).memberReport.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    // --- Platform-wide KPIs (same formulas used everywhere else in the app) ---
    const platform = await getPlatformAumSummary();
    const accountBalance = platform.netAUM; // Investment + ROI − Withdrawals

    // --- Trend: real deposit activity grouped by each row's report date ---
    // (falls back to periodLabel, then the upload date, when `date` isn't a
    // parseable value — report dates are free text from the spreadsheet).
    const trendMap = new Map<string, { principal: number; roi: number; withdrawal: number }>();

    for (const r of reports) {
      const parsedDate = r.date ? new Date(r.date) : null;
      const bucketKey =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().slice(0, 10)
          : r.periodLabel || r.uploadedAt.toISOString().slice(0, 10);

      const entry = trendMap.get(bucketKey) || { principal: 0, roi: 0, withdrawal: 0 };
      entry.principal += parseReportAmount(r.principal) ?? 0;
      entry.roi += parseReportAmount(r.roi) ?? 0;
      entry.withdrawal += parseReportAmount(r.withdrawal) ?? 0;
      trendMap.set(bucketKey, entry);
    }

    // Sort buckets chronologically where possible, otherwise leave insertion
    // order; take the most recent 12 points so the chart stays readable.
    const sortedBuckets = [...trendMap.entries()].sort(([a], [b]) => {
      const da = new Date(a).getTime();
      const db = new Date(b).getTime();
      if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
      return a.localeCompare(b);
    });
    const recentBuckets = sortedBuckets.slice(-12);

    const chart = {
      labels: recentBuckets.map(([label]) => label),
      deposits: recentBuckets.map(([, v]) => v.principal),
      roi: recentBuckets.map(([, v]) => v.roi),
      withdrawals: recentBuckets.map(([, v]) => v.withdrawal),
    };

    // --- Report tables (real data, no fabricated figures) ---
    const deposits = reports
      .filter((r: any) => parseReportAmount(r.principal) !== null && parseReportAmount(r.principal)! > 0)
      .map((r: any) => ({
        id: r.id,
        member: r.memberName || r.memberEmail,
        account: r.accountNo || "—",
        amount: parseReportAmount(r.principal) ?? 0,
        date: r.date || r.uploadedAt.toISOString().slice(0, 10),
      }));

    const roiRows = reports
      .filter((r: any) => parseReportAmount(r.roi) !== null && parseReportAmount(r.roi)! !== 0)
      .map((r: any) => ({
        id: r.id,
        member: r.memberName || r.memberEmail,
        account: r.accountNo || "—",
        amount: parseReportAmount(r.roi) ?? 0,
        date: r.date || r.uploadedAt.toISOString().slice(0, 10),
      }));

    const withdrawalRows = reports
      .filter((r: any) => parseReportAmount(r.withdrawal) !== null && parseReportAmount(r.withdrawal)! > 0)
      .map((r: any) => ({
        id: r.id,
        member: r.memberName || r.memberEmail,
        account: r.accountNo || "—",
        amount: parseReportAmount(r.withdrawal) ?? 0,
        date: r.date || r.uploadedAt.toISOString().slice(0, 10),
      }));

    return NextResponse.json({
      kpis: {
        totalAUM: platform.totalAUM,
        totalRoi: platform.totalRoi,
        totalWithdrawals: platform.totalWithdrawals,
        accountBalance,
        totalInvestors: platform.totalMembers,
      },
      chart,
      reports: {
        deposits,
        roi: roiRows,
        withdrawals: withdrawalRows,
      },
    });
  } catch (err) {
    console.error("Analytics route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
