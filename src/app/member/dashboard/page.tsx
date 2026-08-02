export const runtime = "nodejs"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, Wallet, PiggyBank } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { requireOnboardingComplete } from "@/lib/auth-guard"
import { getMemberReportSummary, parseReportAmount } from "@/lib/member-reports"

export default async function MemberDashboardPage() {
  const user = await requireOnboardingComplete()

  // MemberReport is the source of truth for investment totals. If a member
  // has no report rows uploaded yet, their investment is zero — regardless
  // of any initialInvestment/payment records on file.
  const { rows: reportRows, summary } = await getMemberReportSummary(user.email)

  const totalInvested = summary.totalPrincipal
  const totalRoi = summary.totalRoi
  const totalWithdrawals = summary.totalWithdrawals
  // Account Balance = Total Investment + Total ROI − Total Withdrawals.
  // (Previously this used the raw spreadsheet closing-balance figure, which
  // could be stale or inconsistent — this is now computed the same way
  // everywhere in the app.)
  const netBalance = summary.netBalance
  const currentBalance = summary.netBalance

  // Most recent investment date: the most recent report row that carries a
  // usable amount (closing balance or principal), falling back to that
  // row's upload date if it has no parseable date string.
  const latestAmountRow = reportRows.find(
    (r) => parseReportAmount(r.closingBal) !== null || parseReportAmount(r.principal) !== null
  )
  const parsedDate = latestAmountRow?.date ? new Date(latestAmountRow.date) : null
  const mostRecentInvestment =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate
      : latestAmountRow?.uploadedAt || null

  // ✅ Compute Display Name Based on Account Type
  const firstName = user.fullName?.split(" ")[0] || "Investor"

  const displayName =
    user.accountType === "TEAM"
      ? (user.teamName?.trim() ? `Team ${user.teamName.trim()}` : "Team")
      : firstName

  return (
    <div className="space-y-8">

      {/* Hero Section */}
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Welcome back, {displayName}
            </h1>

            <p className="text-muted-foreground mt-1">
              Here's your investment portfolio summary.
            </p>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className="text-4xl font-bold tracking-tight">
                KES {currentBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Total Investment (KES {totalInvested.toLocaleString("en-US", { maximumFractionDigits: 0 })}) + Total ROI (KES {totalRoi.toLocaleString("en-US", { maximumFractionDigits: 0 })})
                {totalWithdrawals > 0 && ` − Total Withdrawals (KES ${totalWithdrawals.toLocaleString("en-US", { maximumFractionDigits: 0 })})`}
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="gap-2">
            <Link href="/member/deposit">
              Add Investment
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Invested"
          value={`KES ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          icon={<Wallet />}
          subtitle="Per latest performance report"
        />

        <StatCard
          title="Total Withdrawals"
          value={`KES ${totalWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          icon={<ArrowUpRight className="rotate-180" />}
          subtitle="All-time withdrawals"
        />

        <StatCard
          title="Total ROI"
          value={`KES ${totalRoi.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp />}
          subtitle="Cumulative returns earned"
        />

        <StatCard
          title="Last Investment"
          value={
            mostRecentInvestment
              ? format(mostRecentInvestment, "MM/dd/yyyy")
              : "No investments yet"
          }
          icon={<PiggyBank />}
          subtitle="Most recent deposit"
        />
      </section>

      {/* CTA Section */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h3 className="text-lg font-semibold">
              Continue Growing Your Wealth
            </h3>
            <p className="text-sm text-muted-foreground">
              Add funds into your Money Market investment securely.
            </p>
          </div>

          <Button asChild>
            <Link href="/member/deposit">Make Deposit</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ----------------------- Reusable Stat Card ----------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition">
      <CardContent className="p-5">

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>

        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>

      </CardContent>
    </Card>
  )
}