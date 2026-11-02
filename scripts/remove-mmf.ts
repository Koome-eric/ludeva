import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ONE-OFF, idempotent. Run BEFORE deploying the schema that drops
// FundType.MMF and ProductCategory.MONEY_MARKET:
//
//   npx tsx scripts/remove-mmf.ts && npx prisma db push
//
// MongoDB keeps the stored enum strings, so any document still holding
// "MMF" / "MONEY_MARKET" would make Prisma throw when it is read after the
// schema change. This moves those documents to the retired FIXED_DEPOSIT
// type/category (nothing is deleted):
//   - investmentproduct: type/category -> FIXED_DEPOSIT, renamed
//     "Legacy investment", isActive false (no new investments possible)
//   - investment: fundType -> FIXED_DEPOSIT, productName -> "Legacy investment"
// Existing investors' amounts, ROI, dates and payments are untouched.
//
// Raw commands on purpose: the generated client no longer knows the old values.
async function main() {
  const products: any = await prisma.$runCommandRaw({
    update: "investmentproduct",
    updates: [
      {
        q: { $or: [{ type: "MMF" }, { category: "MONEY_MARKET" }] },
        u: {
          $set: {
            type: "FIXED_DEPOSIT",
            category: "FIXED_DEPOSIT",
            name: "Legacy investment",
            isActive: false,
          },
        },
        multi: true,
      },
    ],
  });
  console.log(`✅ Products moved to FIXED_DEPOSIT / "Legacy investment": ${products.nModified ?? 0}`);

  const investments: any = await prisma.$runCommandRaw({
    update: "investment",
    updates: [
      {
        q: { fundType: "MMF" },
        u: { $set: { fundType: "FIXED_DEPOSIT", productName: "Legacy investment" } },
        multi: true,
      },
    ],
  });
  console.log(`✅ Investments moved to FIXED_DEPOSIT / "Legacy investment": ${investments.nModified ?? 0}`);
}

main()
  .catch((err) => {
    console.error("❌ remove-mmf failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
