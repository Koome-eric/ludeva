"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import { FileText, Download, Search, Landmark, TrendingUp, TrendingDown, Wallet, Users, Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function fmtKES(n: number) {
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type ReportRow = { id: string; member: string; account: string; amount: number; date: string };

export default function ReportsPage() {
  const [tab, setTab] = useState<"Deposits" | "ROI" | "Withdrawals">("Deposits");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reports/analytics", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.error || !json.reports) {
          setError(json.error || "Failed to load analytics data.");
          return;
        }
        setError(null);
        setData(json);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
        setError("Failed to load analytics data.");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-destructive">{error}</p>
        <p className="text-muted-foreground text-sm mt-1">
          Check the server logs for /api/reports/analytics for the underlying error.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm py-20">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
      </div>
    );
  }

  const { kpis, chart, reports } = data;

  const rowsForTab: ReportRow[] =
    tab === "Deposits" ? reports.deposits : tab === "ROI" ? reports.roi : reports.withdrawals;

  const filteredRows = rowsForTab.filter(
    (r) =>
      r.member.toLowerCase().includes(search.toLowerCase()) ||
      r.account.toLowerCase().includes(search.toLowerCase())
  );

  const kpiCards = [
    { label: "Total AUM", value: fmtKES(kpis.totalAUM), sub: "cumulative deposits, all members", icon: Landmark, color: "text-emerald-600" },
    { label: "Total ROI", value: fmtKES(kpis.totalRoi), sub: "cumulative returns earned", icon: TrendingUp, color: "text-green-600" },
    { label: "Total Withdrawals", value: fmtKES(kpis.totalWithdrawals), sub: "all-time withdrawals", icon: TrendingDown, color: "text-amber-600" },
    { label: "Account Balance", value: fmtKES(kpis.accountBalance), sub: "Investment + ROI − Withdrawals", icon: Wallet, color: "text-blue-600" },
    { label: "Total Investors", value: String(kpis.totalInvestors), sub: "with report data on file", icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground text-sm">
              Real figures sourced directly from member performance reports
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search member or account"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CSVLink
            data={filteredRows}
            filename={`${tab.toLowerCase()}_report.csv`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition whitespace-nowrap text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Export CSV
          </CSVLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpiCards.map((c) => (
          <Card key={c.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </div>
              <p className={`text-base sm:text-xl font-bold ${c.color} break-words`}>{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-1">Deposit, ROI & Withdrawal Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">By report period — most recent {chart.labels.length} periods with data</p>
          {chart.labels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No report data uploaded yet.</p>
          ) : (
            <div className="h-64 sm:h-80">
              <Line
                data={{
                  labels: chart.labels,
                  datasets: [
                    {
                      label: "Deposits (KES)",
                      data: chart.deposits,
                      borderColor: "rgba(16,185,129,1)",
                      backgroundColor: "rgba(16,185,129,0.15)",
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: "ROI (KES)",
                      data: chart.roi,
                      borderColor: "rgba(59,130,246,1)",
                      backgroundColor: "rgba(59,130,246,0.15)",
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: "Withdrawals (KES)",
                      data: chart.withdrawals,
                      borderColor: "rgba(245,158,11,1)",
                      backgroundColor: "rgba(245,158,11,0.15)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { ticks: { callback: (v) => `KES ${Number(v).toLocaleString()}` } } },
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs & Table Reports */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="Deposits">Deposits</TabsTrigger>
          <TabsTrigger value="ROI">ROI</TabsTrigger>
          <TabsTrigger value="Withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Member</th>
                <th className="text-left p-4">Account</th>
                <th className="text-right p-4">Amount (KES)</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-b last:border-none hover:bg-muted/30">
                  <td className="p-4 font-medium">{r.member}</td>
                  <td className="p-4 text-muted-foreground">{r.account}</td>
                  <td className="p-4 text-right font-semibold">{fmtKES(r.amount)}</td>
                  <td className="p-4 text-muted-foreground">{r.date}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    No {tab.toLowerCase()} records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
