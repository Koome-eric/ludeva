import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDB } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { InvestmentActions } from "./InvestmentActions";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function InvestmentsPage({ searchParams }: PageProps) {
  const { status, from, to } = await searchParams;
  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");

  // Build query filters
  const where: any = { userId: user.id };

  if (status && status !== "all") {
    where.status = status;
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  // Fetch investments
  const investments = await prisma.investment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Investments</h1>
          <p className="text-muted-foreground">Track and manage your investment history.</p>
        </div>

        <Button asChild>
          <Link href="/member/products">Add Investment</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <form className="flex flex-wrap gap-3">
            <select
              name="status"
              defaultValue={status ?? "all"}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
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

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Records</CardTitle>
          <CardDescription>Filter by status or investment date.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>ROI (%)</TableHead>
                  <TableHead>Duration (days)</TableHead>
                  <TableHead className="text-right">Amount (KES)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {investments.length ? (
                  investments.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{format(new Date(inv.createdAt), "dd MMM yyyy")}</TableCell>
                      <TableCell>{inv.productName}</TableCell>
                      <TableCell>{inv.fundType}</TableCell>
                      <TableCell>{inv.category}</TableCell>
                      <TableCell>{inv.roi}</TableCell>
                      <TableCell>{inv.duration}</TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "ACTIVE" ? "success" : "warning"}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <InvestmentActions investment={inv} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      No investments match your filters.
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
