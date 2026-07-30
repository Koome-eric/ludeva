/**
 * Shared helpers for deriving a member's investment figures from their
 * MemberReport rows (the data synced in from Google Sheets / admin uploads).
 *
 * MemberReport is the single source of truth for "how much has this member
 * invested": if a member has no MemberReport rows, their investment is
 * treated as zero, regardless of any deposit/payment records on file.
 */

import { prisma } from "@/lib/prisma";

export interface MemberReportRow {
  id: string;
  date?: string | null;
  principal?: string | null;
  rate?: string | null;
  roi?: string | null;
  withdrawal?: string | null;
  closingBal?: string | null;
  quarter?: string | null;
  notes?: string | null;
  periodLabel?: string | null;
  accountNo?: string | null;
  memberName?: string | null;
  uploadedAt: Date;
  updatedAt: Date;
}

// Parses values like "1,234,567.50" or "KES 1,234" into a finite number,
// returning null when the value isn't a usable number (blank, label rows, etc).
export function parseReportAmount(value?: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export interface MemberInvestmentSummary {
  /**
   * Cumulative investment capital (AUM) for this member — the sum of the
   * `principal` field across every report row (i.e. every deposit ever
   * recorded for them). This is what "deposits from all members, cumulative
   * investment capital" means, and does NOT include ROI or tax, and is NOT
   * reduced by withdrawals.
   */
  totalPrincipal: number;
  /** Sum of `roi` across every report row for this member. */
  totalRoi: number;
  /** Sum of `withdrawal` across every report row for this member. */
  totalWithdrawals: number;
  /**
   * @deprecated kept for backward compatibility with older callers.
   * Used to sum `closingBal` (falling back to `principal`) across all rows,
   * which double counts ROI/tax on top of principal and is NOT a correct AUM
   * figure. Prefer `totalPrincipal` for AUM.
   */
  totalInvested: number;
  /** Net balance = totalPrincipal − totalWithdrawals (deposits minus withdrawals). */
  netBalance: number;
  /** Most recent closing balance across all report rows — this member's current portfolio value (principal + ROI − tax as of their latest entry), NOT their cumulative deposits. */
  latestClosingBalance: number | null;
  /** Most recent report row that contains a usable closing balance / principal, if any. */
  latestRow: MemberReportRow | null;
  /** Whether the member has any report rows at all. */
  hasReports: boolean;
}

/**
 * Computes a member's investment summary purely from their MemberReport rows.
 * Rows are treated as already sorted by `uploadedAt desc` by the caller's query
 * (most recently uploaded report row first).
 *
 * Each row represents a distinct deposit/period entry (not a running total),
 * so cumulative AUM for a member is the sum of `principal` across every row —
 * NOT the latest closing balance, and NOT a sum of closing balances (which
 * would double-count ROI/tax on top of principal).
 */
export function summarizeMemberReports(rows: MemberReportRow[]): MemberInvestmentSummary {
  if (!rows || rows.length === 0) {
    return {
      totalPrincipal: 0,
      totalRoi: 0,
      totalWithdrawals: 0,
      totalInvested: 0,
      netBalance: 0,
      latestClosingBalance: null,
      latestRow: null,
      hasReports: false,
    };
  }

  let totalPrincipal = 0;
  let totalRoi = 0;
  let totalWithdrawals = 0;
  let totalInvested = 0; // deprecated legacy figure, kept for compatibility
  let latestClosingBalance: number | null = null;
  let latestRow: MemberReportRow | null = null;

  for (const row of rows) {
    const closing = parseReportAmount(row.closingBal);
    const principal = parseReportAmount(row.principal);
    const roi = parseReportAmount(row.roi);
    const withdrawal = parseReportAmount(row.withdrawal);

    if (principal !== null) totalPrincipal += principal;
    if (roi !== null) totalRoi += roi;
    if (withdrawal !== null) totalWithdrawals += withdrawal;

    if (closing !== null) {
      totalInvested += closing;
      if (latestClosingBalance === null) {
        latestClosingBalance = closing;
      }
    } else if (principal !== null) {
      totalInvested += principal;
    }

    if (!latestRow && (closing !== null || principal !== null)) {
      latestRow = row;
    }
  }

  if (!latestRow) {
    return {
      totalPrincipal,
      totalRoi,
      totalWithdrawals,
      totalInvested: 0,
      netBalance: totalPrincipal - totalWithdrawals,
      latestClosingBalance: null,
      latestRow: rows[0],
      hasReports: true,
    };
  }

  return {
    totalPrincipal,
    totalRoi,
    totalWithdrawals,
    totalInvested,
    netBalance: totalPrincipal - totalWithdrawals,
    latestClosingBalance,
    latestRow,
    hasReports: true,
  };
}

export interface PlatformAumSummary {
  /** Total AUM: sum of `principal` across every report row, for every member. */
  totalAUM: number;
  /** Sum of `roi` across every report row, for every member. */
  totalRoi: number;
  /** Sum of `withdrawal` across every report row, for every member. */
  totalWithdrawals: number;
  /** Net balance across the platform = totalAUM − totalWithdrawals. */
  netAUM: number;
  /** Count of distinct members (by email) with at least one report row. */
  totalMembers: number;
  /** AUM deposited within rows uploaded since `since` (uses uploadedAt, since the free-text `date` column isn't reliably parseable). */
  aumSince: number;
}

/**
 * Computes platform-wide AUM and related totals directly from ALL MemberReport
 * rows. This is the single source of truth to use for "Total AUM" anywhere in
 * the app (admin dashboard, investments page, etc.) so the figure is
 * consistent everywhere: cumulative deposits (principal) from every member,
 * not a snapshot of current/closing balances.
 */
export async function getPlatformAumSummary(since?: Date): Promise<PlatformAumSummary> {
  const rows: MemberReportRow[] = await (prisma as any).memberReport.findMany();

  let totalAUM = 0;
  let totalRoi = 0;
  let totalWithdrawals = 0;
  let aumSince = 0;
  const members = new Set<string>();

  for (const row of rows) {
    const principal = parseReportAmount(row.principal);
    const roi = parseReportAmount(row.roi);
    const withdrawal = parseReportAmount(row.withdrawal);

    if (principal !== null) {
      totalAUM += principal;
      if (since && row.uploadedAt >= since) aumSince += principal;
    }
    if (roi !== null) totalRoi += roi;
    if (withdrawal !== null) totalWithdrawals += withdrawal;
    if (row.memberEmail) members.add(row.memberEmail);
  }

  return { totalAUM, totalRoi, totalWithdrawals, netAUM: totalAUM - totalWithdrawals, totalMembers: members.size, aumSince };
}

/**
 * Fetches a member's MemberReport rows (newest upload first) and returns
 * both the raw rows and the derived investment summary.
 */
export async function getMemberReportSummary(memberEmail: string): Promise<{
  rows: MemberReportRow[];
  summary: MemberInvestmentSummary;
}> {
  const rows = await (prisma as any).memberReport.findMany({
    where: { memberEmail },
    orderBy: { uploadedAt: "desc" },
  });

  return { rows, summary: summarizeMemberReports(rows) };
}
