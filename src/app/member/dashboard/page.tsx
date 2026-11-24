export const runtime = "nodejs"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, PiggyBank, FileText, MessageCircle, ShieldCheck } from "lucide-react"
import { StatCard } from "@/components/brand/StatCard"
import { AreaChart, Sparkline } from "@/components/brand/charts"
import Link from "next/link"
import { format } from "date-fns"
import { requireOnboardingComplete } from "@/lib/auth-guard"
import { getMemberReportSummary, parseReportAmount } from "@/lib/member-reports"

export default async function MemberDashboardPage() {
  const user = await requireOnboardingComplete()

  // MemberReport is the source of truth for investment totals. If a member
  // has no report rows uploaded yet, their investment is zero — regardless
  // of any initialInvestment/payment records on file.
  const { rows: reportRows, summary } = await getMemberReportSummary({ email: user.email, phone: user.phone })

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

  // Balance history for the charts: one point per report row that carries a
  // closing balance, oldest → newest. Purely presentational — every headline
  // figure above still comes from the summary.
  const history = reportRows
    .map((r) => {
      const value = parseReportAmount(r.closingBal)
      const d = r.date ? new Date(r.date) : new Date(r.uploadedAt)
      return value !== null && !Number.isNaN(d.getTime()) ? { value, d } : null
    })
    .filter((x): x is { value: number; d: Date } => x !== null)
    .sort((a, b) => a.d.getTime() - b.d.getTime())
  const series = history.map((h) => h.value)
  const labels = history.map((h) => format(h.d, "MMM yy"))

  const kes = (n: number, max = 2) =>
    `KES ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: max })}`

  const returnPct = totalInvested > 0 ? (totalRoi / totalInvested) * 100 : null

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero balance card */}
      <section className="fade-up relative overflow-hidden rounded-3xl bg-brand-gradient p-6 shadow-lift sm:p-8">
        <span className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/70">Welcome back, {displayName}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Account balance</p>
            <p className="mt-1 break-words font-headline text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {kes(currentBalance)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {returnPct !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <TrendingUp className="h-3.5 w-3.5 text-gold" />
                  {returnPct.toFixed(1)}% total return
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified account
              </span>
            </div>

            <p className="mt-4 max-w-xl text-xs leading-relaxed text-white/60">
              Total investment ({kes(totalInvested, 0)}) + total return ({kes(totalRoi, 0)})
              {totalWithdrawals > 0 && ` − total withdrawals (${kes(totalWithdrawals, 0)})`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-72 lg:items-end">
            <Sparkline values={series} id="hero" color="hsl(40 65% 62%)" className="hidden h-16 w-full lg:block" />
            <Button asChild variant="gold" size="lg" className="w-full gap-2 lg:w-auto">
              <Link href="/member/deposit">
                Add Investment
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <div className="fade-up fade-up-1">
          <StatCard id="invested" tone="navy" title="Total Invested" value={kes(totalInvested)} caption="Per latest performance report" icon={<Wallet />} series={series} />
        </div>
        <div className="fade-up fade-up-2">
          <StatCard id="return" tone="emerald" title="Total Return" value={kes(totalRoi)} caption="Cumulative returns earned" icon={<TrendingUp />} series={series} />
        </div>
        <div className="fade-up fade-up-3">
          <StatCard id="withdrawals" tone="rose" title="Total Withdrawals" value={kes(totalWithdrawals)} caption="All-time withdrawals" icon={<ArrowDownLeft />} />
        </div>
        <div className="fade-up fade-up-4">
          <StatCard
            id="last"
            tone="gold"
            title="Last Investment"
            value={mostRecentInvestment ? format(mostRecentInvestment, "dd MMM yyyy") : "No investments yet"}
            caption="Most recent deposit"
            icon={<PiggyBank />}
          />
        </div>
      </section>

      {/* Chart + quick actions */}
      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="fade-up lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Portfolio growth</CardTitle>
            <CardDescription>Closing balance across your performance reports</CardDescription>
          </CardHeader>
          <CardContent>
            {series.length > 1 ? (
              <AreaChart values={series} labels={labels} id="growth" format={(n) => `KES ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <TrendingUp className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Your growth chart appears here</p>
                <p className="text-xs text-muted-foreground">Once two or more reports are available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="fade-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick actions</CardTitle>
            <CardDescription>Jump straight to what you need</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { href: "/member/deposit", label: "Make a deposit", icon: Wallet },
              { href: "/member/reports", label: "View my reports", icon: FileText },
              { href: "/member/savings", label: "Savings account", icon: PiggyBank },
              { href: "/member/chat", label: "Message support", icon: MessageCircle },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-all hover:border-gold/60 hover:bg-accent-soft"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{a.label}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
