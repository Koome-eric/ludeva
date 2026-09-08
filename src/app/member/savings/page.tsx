export const runtime = "nodejs";

import { requireOnboardingComplete } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import SavingsClient from "./SavingsClient";

export default async function MemberSavingsPage() {
  const user = await requireOnboardingComplete();

  const entries = await (prisma as any).savingsEntry.findMany({
    where: { memberEmail: user.email },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <SavingsClient
      entries={entries}
      member={{
        email: user.email,
        fullName: user.fullName,
      }}
    />
  );
}
