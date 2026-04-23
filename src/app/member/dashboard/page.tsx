export const runtime = "nodejs"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, Wallet, PiggyBank } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { requireOnboardingComplete } from "@/lib/auth-guard"

export default async function MemberDashboardPage() {
  const user = await requireOnboardingComplete()

  const initialInvestment = user.initialInvestment || 0

  const paymentsResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { userId: user.id, status: "SUCCESS" },
  })

  const depositsTotal = paymentsResult._sum.amount || 0
  const totalInvested = initialInvestment + depositsTotal
  const currentBalance = totalInvested
  const estimatedYield = 9.5

  const lastInvestment = await prisma.payment.findFirst({
    where: { userId: user.id, status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
  })

  let mostRecentInvestment = lastInvestment?.createdAt || null
  if (
    initialInvestment > 0 &&
    (!mostRecentInvestment || user.createdAt > mostRecentInvestment)
  ) {
    mostRecentInvestment = user.createdAt
  }

  // ✅ FIX: Compute Display Name Based on Account Type
  const firstName = user.fullName?.split(" ")[0] || "Investor"

  const displayName =
    user.accountType === "TEAM"
      ? `Team ${firstName}`
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
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-4xl font-bold tracking-tight">
                KES {currentBalance.toLocaleString()}
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
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <StatCard
          title="Total Invested"
          value={`KES ${totalInvested.toLocaleString()}`}
          icon={<Wallet />}
          subtitle="Total deposits made"
        />

        <StatCard
          title="Estimated Yield"
          value={`${estimatedYield}%`}
          icon={<TrendingUp />}
          subtitle="Indicative annual return"
        />

        <StatCard
          title="Last Investment"
          value={
            mostRecentInvestment
              ? format(mostRecentInvestment, "dd MMM yyyy")
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