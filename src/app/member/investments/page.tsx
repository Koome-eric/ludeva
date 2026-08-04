import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getCurrentUserFromDB } from "@/lib/user";
import { redirect } from "next/navigation";
import { assertKycApproved } from "@/lib/auth-guard";
import Link from "next/link";
import { getMemberReportSummary, parseReportAmount } from "@/lib/member-reports";
import { InvestmentActions } from "./InvestmentActions";

function parseROI(value?: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatROI(value?: string | null) {
  const num = parseROI(value);
  if (num === null) return value || "—";
  return num % 1 === 0 ? `${num}` : num.toFixed(2);
}

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

// Display shape consumed by this page and InvestmentActions — derived
// directly from a member's MemberReport rows so it always matches what's
// shown on the Reports page.
export interface InvestmentRowView {
  id: string;
  date: Date;
  accountNo: string;
  periodLabel: string;
  principal: number | null;
  roi: string;
  withdrawal: number | null;
  amount: number; // closing balance (falls back to principal) for this row
  notes: string;
}

export default async function InvestmentsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;
  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");
  assertKycApproved(user);

  const { rows } = await getMemberReportSummary(user.email);

  // Build display rows: only rows that carry an actual amount (closing
  // balance or principal) count as "an investment entry" — quarter/label
  // rows with no figures are excluded here, matching the Reports page.
  let investments: InvestmentRowView[] = rows
    .map((r): InvestmentRowView | null => {
      const closing = parseReportAmount(r.closingBal);
      const principal = parseReportAmount(r.principal);
      const amount = closing ?? principal;
      if (amount === null) return null;

      const parsedDate = r.date ? new Date(r.date) : null;
      const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : r.uploadedAt;

      return {
        id: r.id,
        date,
        accountNo: r.accountNo || "—",
        periodLabel: r.periodLabel || "—",
        principal,
        roi: r.roi || "—",
        withdrawal: parseReportAmount(r.withdrawal),
        amount,
        notes: r.notes || r.quarter || "",
      };
    })
    .filter((r): r is InvestmentRowView => r !== null);

  // Date range filter
  if (from) {
    const fromDate = new Date(from);
    investments = investments.filter((inv) => inv.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    investments = investments.filter((inv) => inv.date <= toDate);
  }

  // Newest first
  investments.sort((a, b) => b.date.getTime() - a.date.getTime());

  const hasAnyReports = rows.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Investments</h1>
          <p className="text-muted-foreground">
            Investment entries recorded against your account, per your performance reports.
          </p>
        </div>

        <Button asChild>
          <Link href="/member/products">Add Investment</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <form className="flex flex-wrap gap-3">
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="border rounded-md px-3 py-2 text-sm"
            />

            <input
              type="date"
              name="to"
              defaultValue={to}
              className="border rounded-md px-3 py-2 text-sm"
            />

            <Button size="sm" type="submit">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Records</CardTitle>
          <CardDescription>
            {hasAnyReports
              ? "Filter by investment date."
              : "No investments have been posted to your account yet — your investment total is zero."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Principal (KES)</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead className="text-right">Withdrawal (KES)</TableHead>
                  <TableHead className="text-right">Closing Balance (KES)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {investments.length ? (
                  investments.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{format(inv.date, "MM/dd/yyyy")}</TableCell>
                      <TableCell>{inv.accountNo}</TableCell>
                      <TableCell>{inv.periodLabel}</TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.principal !== null
                          ? inv.principal.toLocaleString("en-US", { minimumFractionDigits: 2 })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{formatROI(inv.roi)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.withdrawal !== null
                          ? inv.withdrawal.toLocaleString("en-US", { minimumFractionDigits: 2 })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{inv.notes || "—"}</TableCell>
                      <TableCell className="text-right">
                        <InvestmentActions investment={inv} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      {hasAnyReports
                        ? "No investments match your filters."
                        : "You haven't invested yet. Your investment amount is KES 0."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
