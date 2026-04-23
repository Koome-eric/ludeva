import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, CircleDollarSign, Users } from 'lucide-react';
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {

  /* -------------------- DATE CALCULATIONS -------------------- */

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  /* -------------------- TOTAL INVESTORS -------------------- */

  const totalInvestors = await prisma.user.count({
    where: { role: 'MEMBER' },
  });

  /* -------------------- TOTAL AUM -------------------- */
  // Sum of ACTIVE investments
  const activeInvestments = 
    (await prisma.investment.aggregate({
      _sum: { amount: true },
      where: { status: 'ACTIVE' },
    }))._sum.amount || 0;

  // Sum of all initial investments from members
  const initialInvestments = 
    (await prisma.user.aggregate({
      _sum: { initialInvestment: true },
      where: { role: 'MEMBER', initialInvestment: { gt: 0 } },
    }))._sum.initialInvestment || 0;

  const totalAUM = activeInvestments + initialInvestments;

  /* -------------------- MONTHLY DEPOSITS -------------------- */
  // Include active investments created this month + initial investments made this month
  const monthlyActiveInvestments =
    (await prisma.investment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'ACTIVE',
        createdAt: { gte: startOfMonth },
      },
    }))._sum.amount || 0;

  const monthlyInitialInvestments =
    (await prisma.user.aggregate({
      _sum: { initialInvestment: true },
      where: {
        role: 'MEMBER',
        initialInvestment: { gt: 0 },
        createdAt: { gte: startOfMonth },
      },
    }))._sum.initialInvestment || 0;

  const monthlyDeposits = monthlyActiveInvestments + monthlyInitialInvestments;

  /* -------------------- MONTHLY WITHDRAWALS -------------------- */

  const monthlyWithdrawals =
    (await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
        createdAt: { gte: startOfMonth },
      },
    }))._sum.amount || 0;

  /* -------------------- RENDER DASHBOARD -------------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Platform overview and investor management.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL AUM */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total AUM
            </CardTitle>
            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KES {totalAUM.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Total Assets Under Management (Investments + Initial deposits)
            </p>
          </CardContent>
        </Card>

        {/* TOTAL INVESTORS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investors
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalInvestors}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Total registered members
            </p>
          </CardContent>
        </Card>

        {/* MONTHLY DEPOSITS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Deposits
            </CardTitle>
            <ArrowUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KES {monthlyDeposits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Investments activated this month + new member deposits
            </p>
          </CardContent>
        </Card>

        {/* MONTHLY WITHDRAWALS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Withdrawals
            </CardTitle>
            <ArrowDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KES {monthlyWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Successful withdrawals this month
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
