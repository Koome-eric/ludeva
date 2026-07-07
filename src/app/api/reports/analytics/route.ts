// src/app/api/reports/analytics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // --- Transactions & Investments ---
    // Note: `include: { user: true }` was removed — it wasn't used anywhere
    // below (only `.userId` is referenced), and on MongoDB it throws if any
    // row's userId points at a user that no longer exists (e.g. a deleted
    // member), which was silently crashing this whole endpoint.
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: "desc" },
    });

    // --- KPIs ---
    const totalPortfolio = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestors = new Set(investments.map((i) => i.userId)).size;

    const activeInvestors = investments.filter((i) => i.status === "ACTIVE").length;
    const investorRetention = totalInvestors
      ? Math.round((activeInvestors / totalInvestors) * 100)
      : 0;

    // --- Chart: Last 7 Days ---
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    const portfolioTrend = last7Days.map((day) =>
      transactions
        .filter((t) => t.createdAt.toISOString().slice(0, 10) === day)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const retentionTrend = last7Days.map(() => investorRetention);

    // --- Reports Data ---
    const performanceReports = transactions.map((t) => ({
      id: t.id,
      metric: t.type,
      value: t.amount,
      date: t.createdAt.toISOString().slice(0, 10),
    }));

    const returnsReports = investments.map((i) => ({
      id: i.id,
      product: i.productName,
      return: i.roi + "%",
      date: i.createdAt.toISOString().slice(0, 10),
    }));

    const feesReports = transactions
      .filter((t) => t.type === "DEPOSIT")
      .map((t) => ({
        id: t.id,
        product: t.description || "Wallet Deposit",
        fee: Math.round(t.amount * 0.01) + " KES", // Example: 1% fee
        date: t.createdAt.toISOString().slice(0, 10),
      }));

    return NextResponse.json({
      kpis: {
        portfolioGrowth: totalPortfolio,
        totalInvestors,
        investorRetention,
      },
      chart: {
        dates: last7Days,
        portfolioTrend,
        retentionTrend,
      },
      reports: {
        performance: performanceReports,
        returns: returnsReports,
        fees: feesReports,
      },
    });
  } catch (err) {
    console.error("Analytics route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}