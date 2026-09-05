export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { requireOnboardingComplete } from "@/lib/auth-guard"
import { AccountsClient } from "@/components/AccountsClient"

export default async function MemberAccountsPage() {
  const user = await requireOnboardingComplete()

  const [products, applications] = await Promise.all([
    prisma.investmentProduct.findMany({
      where: { type: { in: ["STOCK", "SAVINGS", "JUNIOR"] } },
      orderBy: { roi: "desc" },
    }),
    prisma.juniorAccountApplication.findMany({
      where: { guardianId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const data = {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      roi: p.roi,
      roiMax: p.roiMax,
      minAmount: p.minAmount,
      isActive: p.isActive,
    })),
    applications: applications.map((a) => ({
      id: a.id,
      childFullName: a.childFullName,
      status: a.status,
      reviewNotes: a.reviewNotes,
      createdAt: a.createdAt.toISOString(),
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Your Ludeva Shares, Savings, and Junior accounts — separate from your main MMF investment.
        </p>
      </div>
      <AccountsClient data={data} />
    </div>
  )
}
