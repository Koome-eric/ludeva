import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Hard-coded super admin ID
    const SUPER_ADMIN_CLERK_ID = "user_38qCNW1RIEGrQ6rORph6s2348NX";

    // OPTIONAL: Fetch user from DB (can skip if just testing)
    // const user = await getCurrentUserFromDB();
    // if (user?.clerkId !== SUPER_ADMIN_CLERK_ID) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // -------------------------
    // FETCH ALL SOURCES
    // -------------------------
    const [payments, investments, transactions] = await Promise.all([
      prisma.payment.findMany({ include: { user: { select: { fullName: true, email: true } } } }),
      prisma.investment.findMany({ include: { user: { select: { fullName: true, email: true } } } }),
      prisma.transaction.findMany({ include: { user: { select: { fullName: true, email: true } } } }),
    ]);

    // -------------------------
    // NORMALIZE ALL TRANSACTIONS
    // -------------------------
    let allTransactions = [
      ...payments.map(p => ({
        id: p.id,
        investor: p.user?.fullName || p.user?.email,
        type: "DEPOSIT",
        amount: p.amount,
        status: p.status,
        date: p.createdAt,
      })),
      ...investments.map(i => ({
        id: i.id,
        investor: i.user?.fullName || i.user?.email,
        type: "INVESTMENT",
        amount: -i.amount,
        status: i.status,
        date: i.createdAt,
      })),
      ...transactions.map(t => ({
        id: t.id,
        investor: t.user?.fullName || t.user?.email,
        type: t.type,
        amount: t.type === "WITHDRAWAL" ? -t.amount : t.amount,
        status: t.status,
        date: t.createdAt,
      })),
    ];

    // -------------------------
    // APPLY FILTERS
    // -------------------------
    if (typeFilter && typeFilter !== "all") {
      allTransactions = allTransactions.filter(tx => tx.type === typeFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      allTransactions = allTransactions.filter(tx => tx.status === statusFilter);
    }

    if (from) {
      const fromDate = new Date(from);
      allTransactions = allTransactions.filter(tx => tx.date >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      allTransactions = allTransactions.filter(tx => tx.date <= toDate);
    }

    // -------------------------
    // SORT BY DATE DESCENDING
    // -------------------------
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json(allTransactions);
  } catch (err) {
    console.error("ADMIN TRANSACTIONS FETCH ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}