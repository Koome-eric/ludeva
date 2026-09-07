import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Idempotent: safe to re-run.
//
// 1. Updates "Shares Account": minimum deposit → KES 200,000, rate → a
//    flat 12% p.a. (replacing the previous 9–13% range).
// 2. Deactivates (isActive: false) the retired products: Ludeva MMF,
//    Fixed Deposit, and Ludeva Bonds. Deactivating rather than deleting
//    keeps existing investors' historical Investment records intact —
//    the product just stops accepting new investments and drops off
//    the member catalog and homepage.
//
// Run with: npx tsx scripts/update-shares-and-retire-products.ts
async function main() {
  // ── 1. Shares Account ──
  const shares = await prisma.investmentProduct.findFirst({
    where: { name: "Shares Account" },
  });
  if (shares) {
    await prisma.investmentProduct.update({
      where: { id: shares.id },
      data: { minAmount: 200000, roi: 12, roiMax: null },
    });
    console.log('✅ "Shares Account" updated → min KES 200,000, rate 12% p.a.');
  } else {
    console.warn('⚠️  No product named "Shares Account" found — nothing updated. Run seed-ludeva-accounts.ts first if it hasn\'t been created yet.');
  }

  // ── 2. Retire Ludeva MMF, Fixed Deposit, Ludeva Bonds ──
  const toRetire = await prisma.investmentProduct.findMany({
    where: {
      OR: [
        { type: "MMF" },
        { type: "FIXED_DEPOSIT" },
        { type: "BOND" },
        { category: "FIXED_INCOME" },
        { name: { contains: "MMF", mode: "insensitive" } },
        { name: { contains: "Fixed Deposit", mode: "insensitive" } },
        { name: { contains: "Bond", mode: "insensitive" } },
      ],
      isActive: true,
    },
  });

  if (toRetire.length === 0) {
    console.log("↷ No active MMF / Fixed Deposit / Bond products found — nothing to retire.");
  } else {
    for (const p of toRetire) {
      await prisma.investmentProduct.update({
        where: { id: p.id },
        data: { isActive: false },
      });
      console.log(`✅ Deactivated "${p.name}" (${p.type})`);
    }
  }
}

main()
  .catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
