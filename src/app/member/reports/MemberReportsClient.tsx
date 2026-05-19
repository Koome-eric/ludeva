"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  FileSpreadsheet,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

// Group rows by accountNo + periodLabel
function groupReports(rows: ReportRow[]) {
  const groups: Record<string, ReportRow[]> = {};
  for (const row of rows) {
    const key = `${row.accountNo || "General"} — ${row.periodLabel || "Performance"}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }
  return groups;
}

export default function MemberReportsClient({ reports, member }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>(reports);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Account No", "Period", "Date", "Principal", "Rate", "ROI", "Withdrawal", "Closing Balance", "Quarter/Notes"];
    const csvRows = rows.map((r) => [
      r.accountNo || "",
      r.periodLabel || "",
      r.date || "",
      r.principal || "",
      r.rate || "",
      r.roi || "",
      r.withdrawal || "",
      r.closingBal || "",
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

  const groups = groupReports(rows);
  const hasData = rows.length > 0;

  // Calculate summary stats
  const latestBalance = rows.find((r) => r.closingBal)?.closingBal;
  const latestROI = rows.find((r) => r.roi && r.roi !== "0.00")?.roi;
  const accountNos = [...new Set(rows.map((r) => r.accountNo).filter(Boolean))];

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Account(s)</p>
              <p className="text-lg font-bold text-primary mt-1">
                {accountNos.join(", ") || "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Latest Balance</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {latestBalance ? `KES ${Number(latestBalance.replace(/,/g, "")).toLocaleString()}` : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Latest ROI</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {latestROI || "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Rows</p>
              <p className="text-lg font-bold mt-1">{rows.length}</p>
            </CardContent>
          </Card>
        </div>
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

      {/* Grouped Report Tables */}
      {Object.entries(groups).map(([groupKey, groupRows]) => {
        const isOpen = openGroups[groupKey] !== false; // default open
        return (
          <Card key={groupKey} className="rounded-xl overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none bg-muted/30 py-3 px-4"
              onClick={() => toggleGroup(groupKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">{groupKey}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{groupRows.length} rows</Badge>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
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
                    {groupRows.map((row, idx) => {
                      const isQuarterRow = !row.date && (row.quarter || row.notes);
                      const isPeriodLabel = !row.date && !row.quarter && row.periodLabel;

                      if (isQuarterRow) {
                        return (
                          <tr key={row.id} className="bg-primary/5 border-b">
                            <td colSpan={7} className="px-4 py-2 text-xs font-semibold text-primary italic">
                              {row.quarter || row.notes}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={row.id} className={`border-b last:border-none ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="px-4 py-2.5 font-medium">{row.date || "—"}</td>
                          <td className="px-4 py-2.5 text-right">{row.principal || "—"}</td>
                          <td className="px-4 py-2.5 text-right">{row.rate || "—"}</td>
                          <td className="px-4 py-2.5 text-right text-green-600 font-medium">{row.roi || "—"}</td>
                          <td className="px-4 py-2.5 text-right">{row.withdrawal || "—"}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{row.closingBal || "—"}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        );
      })}

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
