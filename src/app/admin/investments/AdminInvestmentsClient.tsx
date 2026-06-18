"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PieChart } from "lucide-react";

type MemberInvestment = {
  id: string;
  memberEmail: string;
  memberName?: string | null;
  accounts: string[];
  periodLabel?: string | null;
  totalInvested: number;
  latestClosingBalance: number | null;
  totalRoi: number;
  rowCount: number;
  lastUpdated: string;
};

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminInvestmentsClient({
  investments,
}: {
  investments: MemberInvestment[];
}) {
  const [search, setSearch] = useState("");

  const filtered = investments.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.memberEmail.toLowerCase().includes(q) ||
      (inv.memberName?.toLowerCase().includes(q) ?? false) ||
      inv.accounts.some((a) => a.toLowerCase().includes(q)) ||
      (inv.periodLabel?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalAUM = investments.reduce(
    (acc, inv) => acc + (inv.latestClosingBalance ?? 0),
    0
  );
  const totalRoi = investments.reduce((acc, inv) => acc + inv.totalRoi, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Member Investments</h1>
          <p className="text-muted-foreground text-sm">
            Closing balances from member performance reports (Google Sheets sync)
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search member, account, or period…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Members",
            value: investments.length.toString(),
            sub: "with report data",
          },
          {
            label: "Total AUM",
            value: fmt(totalAUM),
            sub: "sum of latest closing balances",
          },
          {
            label: "Total ROI Earned",
            value: fmt(totalRoi),
            sub: "across all periods",
          },
        ].map((k) => (
          <Card key={k.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-xl font-bold mt-1">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Member</th>
                <th className="text-left p-4">Account(s)</th>
                <th className="text-left p-4">Period</th>
                <th className="text-right p-4">Latest Closing Bal</th>
                <th className="text-right p-4">Total ROI</th>
                <th className="text-right p-4">Rows</th>
                <th className="text-right p-4">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-none hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium">{inv.memberName || inv.memberEmail}</p>
                    {inv.memberName && (
                      <p className="text-xs text-muted-foreground">{inv.memberEmail}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {inv.accounts.length > 0 ? (
                        inv.accounts.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {inv.periodLabel || "—"}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {fmt(inv.latestClosingBalance)}
                  </td>
                  <td className="p-4 text-right text-green-600 font-medium">
                    {inv.totalRoi > 0 ? fmt(inv.totalRoi) : "—"}
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {inv.rowCount}
                  </td>
                  <td className="p-4 text-right text-xs text-muted-foreground">
                    {new Date(inv.lastUpdated).toLocaleDateString("en-KE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              <PieChart className="mx-auto h-8 w-8 mb-3" />
              {investments.length === 0
                ? "No member report data found in database."
                : "No results match your search."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
