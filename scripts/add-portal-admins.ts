import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Idempotent: safe to re-run.
//
// Grants the Role.ADMIN role (the same role /admin routes check via
// requireAdmin()/isUserAdmin() in src/lib/auth-guard.ts) to each email
// below, IF that person has already signed up. If someone hasn't signed
// up yet, we can't safely create a full User record for them (too many
// other required onboarding/KYC fields depend on their own input), so
// this script just reports that clearly — ask them to sign up once,
// then re-run this script to promote them.
//
// Run with: npx tsx scripts/add-portal-admins.ts
const NEW_ADMIN_EMAILS = [
  "Kodemba@ludevaplc.co.ke",
  "jamesosano@ludevaplc.co.ke",
];

async function main() {
  for (const rawEmail of NEW_ADMIN_EMAILS) {
    const email = rawEmail.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn(`⚠️  No account found for ${email} yet — ask them to sign up, then re-run this script.`);
      continue;
    }

    if (user.role === "ADMIN") {
      console.log(`↷ ${email} is already an ADMIN — skipping.`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
    console.log(`✅ Granted ADMIN to ${email}`);
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
