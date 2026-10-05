import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { memberKey } from "@/lib/member-identity";
import AdminMemberReportsClient from "./AdminMemberReportsClient";

export default async function AdminMemberReportsPage() {
  await requireAdmin();

  const reports = await (prisma as any).memberReport.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  // Group by member (email, else phone) for summary
  const memberSummary: Record<string, { count: number; accounts: string[]; lastPush: string }> = {};
  for (const r of reports) {
    const e = memberKey(r);
    if (!e) continue;
    if (!memberSummary[e]) memberSummary[e] = { count: 0, accounts: [], lastPush: r.uploadedAt };
    memberSummary[e].count++;
    if (r.accountNo && !memberSummary[e].accounts.includes(r.accountNo)) {
      memberSummary[e].accounts.push(r.accountNo);
    }
    if (new Date(r.uploadedAt) > new Date(memberSummary[e].lastPush)) {
      memberSummary[e].lastPush = r.uploadedAt;
    }
  }

  return <AdminMemberReportsClient reports={reports} memberSummary={memberSummary} />;
}
