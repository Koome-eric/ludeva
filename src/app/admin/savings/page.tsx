import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { memberKey } from "@/lib/member-identity";
import AdminSavingsClient from "./AdminSavingsClient";

export default async function AdminSavingsPage() {
  await requireAdmin();

  const entries = await (prisma as any).savingsEntry.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  // Group by member (email, else phone) for summary
  const memberSummary: Record<string, { count: number; accounts: string[]; lastPush: string }> = {};
  for (const e of entries) {
    const email = memberKey(e);
    if (!email) continue;
    if (!memberSummary[email]) memberSummary[email] = { count: 0, accounts: [], lastPush: e.uploadedAt };
    memberSummary[email].count++;
    if (e.accountNo && !memberSummary[email].accounts.includes(e.accountNo)) {
      memberSummary[email].accounts.push(e.accountNo);
    }
    if (new Date(e.uploadedAt) > new Date(memberSummary[email].lastPush)) {
      memberSummary[email].lastPush = e.uploadedAt;
    }
  }

  return <AdminSavingsClient entries={entries} memberSummary={memberSummary} />;
}
