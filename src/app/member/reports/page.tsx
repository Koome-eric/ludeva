export const runtime = "nodejs";

import { requireOnboardingComplete } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import MemberReportsClient from "./MemberReportsClient";

export default async function MemberReportsPage() {
  const user = await requireOnboardingComplete();

  const reports = await (prisma as any).memberReport.findMany({
    where: { memberEmail: user.email },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <MemberReportsClient
      reports={reports}
      member={{
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
      }}
    />
  );
}
