export const runtime = "nodejs";

import { requireOnboardingComplete } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { memberRowsWhere } from "@/lib/member-identity";
import MemberReportsClient from "./MemberReportsClient";

export default async function MemberReportsPage() {
  const user = await requireOnboardingComplete();

  const reports = await (prisma as any).memberReport.findMany({
    where: memberRowsWhere({ email: user.email, phone: user.phone }),
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
