"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Wallet,
  FileSpreadsheet,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { parseReportAmount } from "@/lib/member-reports";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ReportRow {
  id: string;
  date?: string;
  principal?: string;
  rate?: string;
  roi?: string;
  withdrawal?: string;
  closingBal?: string;
  quarter?: string;
  notes?: string;
  periodLabel?: string;
  accountNo?: string;
  memberName?: string;
  uploadedAt: string;
}

interface Props {
  reports: ReportRow[];
  member: {
    email: string;
    fullName?: string | null;
    accountType?: string;
  };
}

// Sort rows by account, then period — keeps related rows
// adjacent in the single table without needing separate sections.
function sortReports(rows: ReportRow[]) {
  return [...rows].sort((a, b) => {
    const acctA = a.accountNo || "";
    const acctB = b.accountNo || "";
    if (acctA !== acctB) return acctA.localeCompare(acctB);

    const periodA = a.periodLabel || "";
    const periodB = b.periodLabel || "";
    if (periodA !== periodB) return periodA.localeCompare(periodB);

    return 0;
  });
}

function parseReportRowDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatReportDate(value?: string | null) {
  const date = parseReportRowDate(value);
  if (date) return format(date, "MM/dd/yyyy");
  return value || "—";
}

function formatNumeric(value?: string | null) {
  const amount = parseReportAmount(value);
  if (amount === null) return "—";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

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

export default function MemberReportsClient({ reports, member }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>(reports);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/member-reports");
      const data = await res.json();
      setRows(data.reports || []);
    } finally {
      setRefreshing(false);
    }
  };

  const sortedRows = sortReports(rows);
  const hasData = sortedRows.length > 0;

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Account No", "Period", "Date", "Principal", "Rate", "ROI", "Withdrawal", "Closing Balance", "Quarter/Notes"];
    const csvRows = sortedRows.map((r) => [
      r.accountNo || "",
      r.periodLabel || "",
      formatReportDate(r.date),
      formatNumeric(r.principal),
      r.rate || "",
      formatROI(r.roi),
      formatNumeric(r.withdrawal),
      formatNumeric(r.closingBal),
      r.quarter || r.notes || "",
    ]);
    const csv = [headers, ...csvRows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ludeva_Performance_Report_${member.email}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  // Account Balance = Total Investment + Total ROI − Total Withdrawals.
  // (Summing the "Closing Balance" column across every row would double-count
  // — each row is a snapshot for that period, not an incremental amount.)
  const totalPrincipal = sortedRows.reduce((sum, row) => sum + (parseReportAmount(row.principal) ?? 0), 0);
  const totalRoiSum = sortedRows.reduce((sum, row) => sum + (parseReportAmount(row.roi) ?? 0), 0);
  const totalWithdrawalsSum = sortedRows.reduce((sum, row) => sum + (parseReportAmount(row.withdrawal) ?? 0), 0);
  const accountBalance = totalPrincipal + totalRoiSum - totalWithdrawalsSum;
  const accountNos = [...new Set(sortedRows.map((r) => r.accountNo).filter(Boolean))];

  // Trend chart — real per-period figures (not synthetic), grouped by the
  // row's period label (falls back to date) so it reflects exactly what's in
  // the account statement below.
  const chartData = useMemo(() => {
    const byPeriod = new Map<string, { principal: number; roi: number; withdrawal: number; order: number }>();
    sortedRows.forEach((row, idx) => {
      if (!row.date && (row.quarter || row.notes) && !row.principal && !row.roi) return; // skip pure label rows
      const key = row.periodLabel || formatReportDate(row.date) || `Row ${idx + 1}`;
      const entry = byPeriod.get(key) || { principal: 0, roi: 0, withdrawal: 0, order: idx };
      entry.principal += parseReportAmount(row.principal) ?? 0;
      entry.roi += parseReportAmount(row.roi) ?? 0;
      entry.withdrawal += parseReportAmount(row.withdrawal) ?? 0;
      byPeriod.set(key, entry);
    });
    return [...byPeriod.entries()]
      .map(([period, v]) => ({ period, ...v }))
      .sort((a, b) => a.order - b.order)
      .slice(-12);
  }, [sortedRows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            My Performance Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Account statement and investment performance data for {member.fullName || member.email}
            {accountNos.length > 0 && ` · Account${accountNos.length > 1 ? "s" : ""}: ${accountNos.join(", ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {hasData && (
            <Button size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="rounded-xl border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Landmark className="h-3.5 w-3.5" /> Total Investment
              </div>
              <p className="text-base sm:text-lg font-bold break-words">
                {`KES ${totalPrincipal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Total ROI
              </div>
              <p className="text-base sm:text-lg font-bold text-green-600 break-words">
                {`KES ${totalRoiSum.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingDown className="h-3.5 w-3.5" /> Total Withdrawals
              </div>
              <p className="text-base sm:text-lg font-bold text-amber-600 break-words">
                {`KES ${totalWithdrawalsSum.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Wallet className="h-3.5 w-3.5" /> Account Balance
              </div>
              <p className="text-base sm:text-lg font-bold text-blue-600 break-words">
                {`KES ${accountBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend chart — real per-period figures from the statement below */}
      {hasData && chartData.length > 0 && (
        <Card className="rounded-xl">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-base font-bold mb-1">Performance Trend</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Investment, ROI, and withdrawals by period — most recent {chartData.length} periods
            </p>
            <div className="h-64 sm:h-72 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => `KES ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="principal" name="Investment" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawal" name="Withdrawal" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="roi" name="ROI" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {!hasData && (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Performance Data Yet</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
              Your account performance data will appear here once it has been uploaded by Ludeva.
              Please contact us at{" "}
              <a href="mailto:invest@ludevaplc.co.ke" className="text-primary underline">
                invest@ludevaplc.co.ke
              </a>{" "}
              for queries.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Single unified report table */}
      {hasData && (
        <Card className="rounded-xl overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Account</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Period</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Principal (KES)</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">ROI</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Withdrawal</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Closing Balance (KES)</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => {
                  const isQuarterRow = !row.date && (row.quarter || row.notes);

                  if (isQuarterRow) {
                    return (
                      <tr key={row.id} className="bg-primary/5 border-b">
                        <td className="px-4 py-2 text-xs text-muted-foreground">{row.accountNo || "—"}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{row.periodLabel || "—"}</td>
                        <td colSpan={7} className="px-4 py-2 text-xs font-semibold text-primary italic">
                          {row.quarter || row.notes}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.id} className={`border-b last:border-none ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.accountNo || "—"}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.periodLabel || "—"}</td>
                      <td className="px-4 py-2.5 font-medium">{formatReportDate(row.date)}</td>
                      <td className="px-4 py-2.5 text-right">{formatNumeric(row.principal)}</td>
                      <td className="px-4 py-2.5 text-right">{row.rate || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-green-600 font-medium">{formatROI(row.roi)}</td>
                      <td className="px-4 py-2.5 text-right">{formatNumeric(row.withdrawal)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatNumeric(row.closingBal)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Footer note */}
      {hasData && (
        <p className="text-xs text-muted-foreground text-center">
          Ludeva Investment Performance Report · For queries email{" "}
          <a href="mailto:invest@ludevaplc.co.ke" className="text-primary">invest@ludevaplc.co.ke</a>
        </p>
      )}
    </div>
  );
}
