import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDB } from "@/lib/user";
import { redirect } from "next/navigation";
import { assertKycApproved } from "@/lib/auth-guard";
import { format } from "date-fns";
import { ExportButton } from "./ExportButton";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
    type?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { status, from, to, type } = await searchParams;

  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");
  assertKycApproved(user);

  /* ---------------------------------- */
  /* Fetch ALL Data (No Filters)        */
  /* ---------------------------------- */

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
  });

  const investments = await prisma.investment.findMany({
    where: { userId: user.id },
  });

  const withdrawals = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "WITHDRAWAL",
    },
  });

  /* ---------------------------------- */
  /* Normalize Transactions             */
  /* ---------------------------------- */

  let transactions = [
    ...payments.map(p => ({
      id: p.id,
      date: p.createdAt,
      description: p.description || "Wallet Deposit",
      amount: p.amount,
      status: p.status,
      type: "DEPOSIT",
    })),

    ...investments.map(inv => ({
      id: inv.id,
      date: inv.createdAt,
      description: `Investment in ${inv.productName}`,
      amount: -inv.amount,
      status: inv.status,
      type: "INVESTMENT",
    })),

    ...withdrawals.map(w => ({
      id: w.id,
      date: w.createdAt,
      description: "Withdrawal",
      amount: -w.amount,
      status: w.status,
      type: "WITHDRAWAL",
    })),
  ];

  /* ---------------------------------- */
  /* Apply Filters (SAFE & CONSISTENT)  */
  /* ---------------------------------- */

  if (type && type !== "all") {
    transactions = transactions.filter(tx => tx.type === type);
  }

  if (status && status !== "all") {
    transactions = transactions.filter(tx => tx.status === status);
  }

  if (from) {
    const fromDate = new Date(from);
    transactions = transactions.filter(tx => tx.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    transactions = transactions.filter(tx => tx.date <= toDate);
  }

  transactions = transactions.sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Complete financial activity on your account.
          </p>
        </div>

        <ExportButton data={transactions} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap gap-3">
            <select
              name="type"
              defaultValue={type || "all"}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="INVESTMENT">Investments</option>
              <option value="WITHDRAWAL">Withdrawals</option>
            </select>

            <select
              name="status"
              defaultValue={status || "all"}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="ACTIVE">Active</option>
            </select>

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

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">
                  Amount (KES)
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.length ? (
                transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(tx.date, "dd MMM yyyy")}
                    </TableCell>

                    <TableCell>{tx.description}</TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {tx.type}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className={`text-right font-mono ${
                        tx.amount >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.amount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
