import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, CircleDollarSign, Users } from 'lucide-react';
import { getPlatformAumSummary } from '@/lib/member-reports';

export default async function AdminDashboardPage() {

  /* -------------------- DATE CALCULATIONS -------------------- */

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  /* -------------------- AUM, INVESTORS, ROI, WITHDRAWALS -------------------- */
  // MemberReport is the single source of truth for member deposits (synced in
  // from the Google Sheets performance tracker). AUM = cumulative principal
  // deposited by all members — matches "all the deposits from all members,
  // cumulative investment capital".
  const platform = await getPlatformAumSummary(startOfMonth);

  const totalInvestors = platform.totalMembers;
  const totalAUM = platform.totalAUM;

  /* -------------------- MONTHLY DEPOSITS -------------------- */
  // Principal recorded on rows uploaded/synced since the start of this month.
  // Note: this uses `uploadedAt` (when the row was pushed in), not the report's
  // free-text `date` column, since that column isn't reliably parseable.
  const monthlyDeposits = platform.aumSince;

  /* -------------------- MONTHLY WITHDRAWALS -------------------- */
  // Currently reflects withdrawals across ALL time recorded in MemberReport,
  // since withdrawal rows aren't reliably dated. If per-month withdrawal
  // tracking is needed, the sheet should record a proper date per withdrawal.
  const monthlyWithdrawals = platform.totalWithdrawals;

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
              Total recorded withdrawals (all time)
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
