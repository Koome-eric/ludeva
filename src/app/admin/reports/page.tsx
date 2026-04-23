"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import { FileText, Download, Search } from "lucide-react";
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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const [tab, setTab] = useState("Performance");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/reports/analytics");
      const json = await res.json();
      setData(json);
    };
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p className="p-6">Loading analytics...</p>;

  const { kpis, chart, reports } = data;

  const filteredPerformance = reports.performance.filter((r: any) =>
    r.metric.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReturns = reports.returns.filter((r: any) =>
    r.product.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFees = reports.fees.filter((r: any) =>
    r.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Monitor performance, returns, fees, and live trends
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CSVLink
            data={tab === "Performance" ? filteredPerformance : tab === "Returns" ? filteredReturns : filteredFees}
            filename={`${tab.toLowerCase()}_reports.csv`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </CSVLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow">
          <CardContent>
            <h3 className="text-sm font-medium text-muted-foreground">Portfolio Growth</h3>
            <p className="text-2xl font-bold text-green-600">{kpis.portfolioGrowth}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow">
          <CardContent>
            <h3 className="text-sm font-medium text-muted-foreground">Investor Retention</h3>
            <p className="text-2xl font-bold text-blue-600">{kpis.investorRetention}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow">
          <CardContent>
            <h3 className="text-sm font-medium text-muted-foreground">Active Investors</h3>
            <p className="text-2xl font-bold text-purple-600">{kpis.totalInvestors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="rounded-2xl shadow-sm mt-4">
        <CardContent>
          <h2 className="text-lg font-bold mb-4">Performance Trend (Last 7 Days)</h2>
          <Line
            data={{
              labels: chart.dates,
              datasets: [
                {
                  label: "Portfolio Growth",
                  data: chart.portfolioTrend,
                  borderColor: "rgba(16,185,129,1)",
                  backgroundColor: "rgba(16,185,129,0.2)",
                },
                {
                  label: "Investor Retention",
                  data: chart.retentionTrend,
                  borderColor: "rgba(59,130,246,1)",
                  backgroundColor: "rgba(59,130,246,0.2)",
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: "top" } } }}
          />
        </CardContent>
      </Card>

      {/* Tabs & Table Reports */}
      <Tabs defaultValue="Performance" onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="Performance">Performance</TabsTrigger>
          <TabsTrigger value="Returns">Returns</TabsTrigger>
          <TabsTrigger value="Fees">Fees</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl shadow-sm mt-4">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {tab === "Performance" && (
                  <>
                    <th className="text-left p-4">Metric</th>
                    <th className="text-left p-4">Value</th>
                    <th className="text-left p-4">Date</th>
                  </>
                )}
                {tab === "Returns" && (
                  <>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Return</th>
                    <th className="text-left p-4">Date</th>
                  </>
                )}
                {tab === "Fees" && (
                  <>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Fee</th>
                    <th className="text-left p-4">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(tab === "Performance"
                ? filteredPerformance
                : tab === "Returns"
                ? filteredReturns
                : filteredFees
              ).map((r: any) => (
                <tr key={r.id} className="border-b last:border-none hover:bg-gray-50">
                  {tab === "Performance" && (
                    <>
                      <td className="p-4 font-medium">{r.metric}</td>
                      <td className="p-4 font-semibold">{r.value}</td>
                      <td className="p-4">{r.date}</td>
                    </>
                  )}
                  {tab === "Returns" && (
                    <>
                      <td className="p-4 font-medium">{r.product}</td>
                      <td className="p-4 font-semibold">{r.return}</td>
                      <td className="p-4">{r.date}</td>
                    </>
                  )}
                  {tab === "Fees" && (
                    <>
                      <td className="p-4 font-medium">{r.product}</td>
                      <td className="p-4 font-semibold">{r.fee}</td>
                      <td className="p-4">{r.date}</td>
                    </>
                  )}
                </tr>
              ))}
              {(tab === "Performance"
                ? filteredPerformance
                : tab === "Returns"
                ? filteredReturns
                : filteredFees
              ).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-muted-foreground">
                    No reports found
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