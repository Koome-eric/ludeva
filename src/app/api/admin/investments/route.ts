// src/app/api/admin/investments/route.ts
// Internal admin endpoint — authenticated via SHEETS_API_SECRET header
// (same secret used by Google Sheets AppScript push)
// This avoids Clerk redirect issues in client-side fetch calls.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReportAmount, summarizeMemberReports } from "@/lib/member-reports";

const SHEETS_API_SECRET = process.env.SHEETS_API_SECRET || "ludeva-sheets-secret-2025";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-sheets-secret");
  if (secret !== SHEETS_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await (prisma as any).memberReport.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    // Group by member email
    const byMember: Record<string, typeof reports> = {};
    for (const row of reports) {
      if (!byMember[row.memberEmail]) byMember[row.memberEmail] = [];
      byMember[row.memberEmail].push(row);
    }

    const investments = Object.entries(byMember).map(([email, rows]) => {
      const summary = summarizeMemberReports(rows as any);
      const latestRow = (summary.latestRow ?? rows[0]) as any;

      const accounts = [...new Set(
        rows.map((r: any) => r.accountNo).filter(Boolean)
      )] as string[];

      const periodLabel = rows.find((r: any) => r.periodLabel)?.periodLabel ?? null;

      const totalRoi = rows.reduce((acc: number, r: any) => {
        const roi = parseReportAmount(r.roi);
        return roi !== null ? acc + roi : acc;
      }, 0);

      return {
        id: email,
        memberEmail: email,
        memberName: rows.find((r: any) => r.memberName)?.memberName ?? null,
        accounts,
        periodLabel,
        // Cumulative capital deposited by this member (sum of principal across
        // every deposit row) — this is what "AUM" should mean.
        totalPrincipal: summary.totalPrincipal,
        // Current portfolio value as of their latest entry (principal + ROI - tax).
        // NOT the same as cumulative deposits — kept for the per-row balance column.
        latestClosingBalance: summary.latestClosingBalance,
        totalInvested: summary.totalInvested,
        totalRoi,
        rowCount: rows.length,
        lastUpdated: latestRow.uploadedAt,
      };
    });

    investments.sort((a, b) => b.totalPrincipal - a.totalPrincipal);

    return NextResponse.json(investments);
  } catch (err) {
    console.error("Fetch investments error:", err);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}
