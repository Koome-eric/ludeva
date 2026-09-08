"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Wallet, TrendingUp, ArrowDownCircle, Download, RefreshCw } from "lucide-react";
import { parseReportAmount } from "@/lib/member-reports";

interface SavingsRow {
  id: string;
  accountNo?: string;
  memberName?: string;
  date?: string;
  openingBalance?: string;
  deposit?: string;
  withdrawal?: string;
  monthlyRate?: string;
  interestEarned?: string;
  closingBalance?: string;
  periodLabel?: string;
  notes?: string;
  uploadedAt: string;
}

interface Props {
  entries: SavingsRow[];
  member: {
    email: string;
    fullName?: string | null;
  };
}

function formatAmount(value?: string | null) {
  const amount = parseReportAmount(value);
  if (amount === null) return value || "—";
  return amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Rows come in newest-first (uploadedAt desc); oldest-first is the natural
// reading order for a running balance, so sort back to chronological here.
function sortChronological(rows: SavingsRow[]) {
  return [...rows].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
}

export default function SavingsClient({ entries: initialEntries, member }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<SavingsRow[]>(initialEntries);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/savings");
      const data = await res.json();
      setEntries(data.entries || []);
    } finally {
      setRefreshing(false);
    }
  };

  const chronological = sortChronological(entries);
  const latest = chronological[chronological.length - 1];
  const hasData = chronological.length > 0;

  const totalDeposits = chronological.reduce((sum, r) => sum + (parseReportAmount(r.deposit) ?? 0), 0);
  const totalWithdrawals = chronological.reduce((sum, r) => sum + (parseReportAmount(r.withdrawal) ?? 0), 0);
  const totalInterest = chronological.reduce((sum, r) => sum + (parseReportAmount(r.interestEarned) ?? 0), 0);
  const accountNos = [...new Set(chronological.map((r) => r.accountNo).filter(Boolean))];

  const exportCSV = () => {
    const headers = ["Account No", "Period", "Date", "Opening Balance", "Deposit", "Withdrawal", "Rate", "Interest Earned", "Closing Balance", "Notes"];
    const rows = chronological.map((r) => [
      r.accountNo || "",
      r.periodLabel || "",
      r.date || "",
      formatAmount(r.openingBalance),
      formatAmount(r.deposit),
      formatAmount(r.withdrawal),
      r.monthlyRate || "",
      formatAmount(r.interestEarned),
      formatAmount(r.closingBalance),
      r.notes || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ludeva_Savings_Statement_${member.email}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            My Savings Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            A running balance separate from your Investments — each entry carries the previous
            closing balance forward, adds any deposit, subtracts any withdrawal, then applies interest.
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

      {/* Current balance + KPI cards */}
      {hasData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="rounded-xl border-l-4 border-l-primary col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <PiggyBank className="h-3.5 w-3.5" /> Current Balance
              </div>
              <p className="text-base sm:text-lg font-bold break-words">
                {`KES ${formatAmount(latest?.closingBalance)}`}
              </p>
              {(latest?.periodLabel || latest?.date) && (
                <p className="text-xs text-muted-foreground mt-1">As of {latest?.periodLabel || latest?.date}</p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Wallet className="h-3.5 w-3.5" /> Total Deposits
              </div>
              <p className="text-base sm:text-lg font-bold break-words">{`KES ${totalDeposits.toLocaleString()}`}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Total Interest
              </div>
              <p className="text-base sm:text-lg font-bold text-green-600 break-words">{`KES ${totalInterest.toLocaleString()}`}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <ArrowDownCircle className="h-3.5 w-3.5" /> Total Withdrawals
              </div>
              <p className="text-base sm:text-lg font-bold break-words">{`KES ${totalWithdrawals.toLocaleString()}`}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="rounded-xl">
          <CardContent className="p-10 text-center text-muted-foreground">
            <PiggyBank className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p>No savings entries yet. Your admin will add these as your account is updated.</p>
          </CardContent>
        </Card>
      )}

      {/* Transaction history */}
      {hasData && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs text-muted-foreground">
                    {["Period", "Date", "Opening", "Deposit", "Withdrawal", "Rate", "Interest", "Closing Balance"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chronological
                    .slice()
                    .reverse()
                    .map((r, i) => (
                      <tr key={r.id} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3 whitespace-nowrap">{r.periodLabel || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.date || "—"}</td>
                        <td className="px-4 py-3 text-right">{formatAmount(r.openingBalance)}</td>
                        <td className="px-4 py-3 text-right">{r.deposit ? formatAmount(r.deposit) : "—"}</td>
                        <td className="px-4 py-3 text-right">{r.withdrawal ? formatAmount(r.withdrawal) : "—"}</td>
                        <td className="px-4 py-3 text-right">{r.monthlyRate || "—"}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          {r.interestEarned ? formatAmount(r.interestEarned) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <Badge variant="secondary">{formatAmount(r.closingBalance)}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
