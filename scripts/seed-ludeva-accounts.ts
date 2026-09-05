import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Idempotent: safe to re-run.
//
// 1. Renames the first active STOCK/EQUITY product to "Shares Account"
//    and sets its rate to 9–13% p.a., per the client's request to
//    "replace the current account name to shares account." If no such
//    product exists yet, it creates one.
// 2. Creates "Savings Account" (up to 7% p.a.) if it doesn't exist.
// 3. Creates "Ludeva Junior Account" (up to 6% p.a.) if it doesn't exist.
//
// Run with: npx tsx scripts/seed-ludeva-accounts.ts
async function main() {
  // ── 1. Shares Account (rename existing Stocks/EQUITY product) ──
  const existingShares = await prisma.investmentProduct.findFirst({
    where: { OR: [{ type: "STOCK" }, { category: "EQUITY" }] },
  });

  if (existingShares) {
    await prisma.investmentProduct.update({
      where: { id: existingShares.id },
      data: { name: "Shares Account", type: "STOCK", category: "EQUITY", roi: 9, roiMax: 13 },
    });
    console.log(`✅ Renamed "${existingShares.name}" → "Shares Account" (9–13% p.a.)`);
  } else {
    await prisma.investmentProduct.create({
      data: {
        name: "Shares Account",
        type: "STOCK",
        category: "EQUITY",
        description: "Buy shares in Ludeva and earn a dividend on your holding.",
        roi: 9,
        roiMax: 13,
        duration: 365,
        minAmount: 1000,
        isActive: true,
      },
    });
    console.log('✅ Created "Shares Account" (9–13% p.a.)');
  }

  // ── 2. Savings Account ──
  const existingSavings = await prisma.investmentProduct.findFirst({
    where: { name: "Savings Account" },
  });
  if (!existingSavings) {
    await prisma.investmentProduct.create({
      data: {
        name: "Savings Account",
        type: "SAVINGS",
        category: "SAVINGS",
        description: "A flexible savings account earning up to 7% p.a.",
        roi: 7,
        roiMax: null,
        duration: 30,
        minAmount: 500,
        isActive: true,
      },
    });
    console.log('✅ Created "Savings Account" (up to 7% p.a.)');
  } else {
    console.log('↷ "Savings Account" already exists, skipping.');
  }

  // ── 3. Ludeva Junior Account ──
  const existingJunior = await prisma.investmentProduct.findFirst({
    where: { name: "Ludeva Junior Account" },
  });
  if (!existingJunior) {
    await prisma.investmentProduct.create({
      data: {
        name: "Ludeva Junior Account",
        type: "JUNIOR",
        category: "JUNIOR",
        description:
          "A savings account opened by a parent/guardian on behalf of a child, earning up to 6% p.a. Requires the child's birth certificate and passport photo, plus the guardian's ID/passport, phone number, and KRA PIN — reviewed by an admin before the account is opened.",
        roi: 6,
        roiMax: null,
        duration: 365,
        minAmount: 500,
        isActive: true,
      },
    });
    console.log('✅ Created "Ludeva Junior Account" (up to 6% p.a.)');
  } else {
    console.log('↷ "Ludeva Junior Account" already exists, skipping.');
  }
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
