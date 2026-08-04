/**
 * One-time backfill: run this ONCE, right after deploying the KYC approval
 * gate, and BEFORE your existing members try to log in.
 *
 * Why this is needed:
 * Until now, kycStatus was never actually enforced anywhere — completing
 * the onboarding form gave immediate full portal access regardless of
 * review status. That's the gap that let unapproved sign-ups in. Fixing it
 * means every account whose kycStatus is still the default "PENDING" will
 * now be redirected to /member/pending-approval on next login — including
 * your real, existing, legitimate members who were never explicitly
 * approved because approval never actually gated anything before.
 *
 * This script auto-approves (grandfathers in) any member who already has
 * real investment data on file — i.e. at least one MemberReport row tied
 * to their email. That's a reasonable proxy for "this is a real, existing
 * investor with an actual track record", not a fresh/unverified sign-up.
 *
 * Members with NO report data and still-PENDING status are left untouched
 * — those are exactly the accounts worth an admin actually reviewing
 * (which includes any recent unverified sign-ups you've been seeing).
 *
 * Usage (after `npm install` locally):
 *   npx tsx scripts/backfill-kyc-approval.ts
 *
 * Safe to re-run — it only touches PENDING members with report data, and
 * running it again after they're already APPROVED is a no-op.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pendingMembers = await prisma.user.findMany({
    where: { role: "MEMBER", kycStatus: "PENDING" },
    select: { id: true, email: true, fullName: true },
  });

  console.log(`Found ${pendingMembers.length} member(s) with PENDING KYC status.`);

  if (pendingMembers.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let approved = 0;
  let leftPending = 0;

  for (const member of pendingMembers) {
    const reportCount = await prisma.memberReport.count({
      where: { memberEmail: member.email },
    });

    if (reportCount > 0) {
      await prisma.user.update({
        where: { id: member.id },
        data: { kycStatus: "APPROVED" },
      });
      approved++;
      console.log(`✅ Approved: ${member.fullName || member.email} (${reportCount} report row(s) on file)`);
    } else {
      leftPending++;
      console.log(`⏳ Left pending: ${member.fullName || member.email} (no report data — needs real admin review)`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Auto-approved (existing investors with report data): ${approved}`);
  console.log(`Left pending for manual review (no report data on file): ${leftPending}`);
  console.log("\nReview the ones left pending at /admin/investors/kyc.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
