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
  /** Current total investment value for the member, derived from reports. Zero if no reports exist. */
  totalInvested: number;
  /** Most recent closing balance found across all report rows, if any. */
  latestClosingBalance: number | null;
  /** Most recent report row that contains a usable closing balance / principal, if any. */
  latestRow: MemberReportRow | null;
  /** Whether the member has any report rows at all. */
  hasReports: boolean;
}

/**
 * Computes a member's investment summary purely from their MemberReport rows.
 * Rows are treated as already sorted by `uploadedAt desc` by the caller's query
 * (most recently uploaded report row first); the latest row with a usable
 * closing balance (falling back to principal) determines the current total.
 */
export function summarizeMemberReports(rows: MemberReportRow[]): MemberInvestmentSummary {
  if (!rows || rows.length === 0) {
    return { totalInvested: 0, latestClosingBalance: null, latestRow: null, hasReports: false };
  }

  // Find the most recently uploaded row that carries a usable amount
  // (prefer closingBal; fall back to principal for rows that only record a deposit).
  for (const row of rows) {
    const closing = parseReportAmount(row.closingBal);
    if (closing !== null) {
      return { totalInvested: closing, latestClosingBalance: closing, latestRow: row, hasReports: true };
    }
  }
  for (const row of rows) {
    const principal = parseReportAmount(row.principal);
    if (principal !== null) {
      return { totalInvested: principal, latestClosingBalance: null, latestRow: row, hasReports: true };
    }
  }

  // Member has report rows, but none carry a parseable amount yet (e.g. only label rows).
  return { totalInvested: 0, latestClosingBalance: null, latestRow: rows[0], hasReports: true };
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
