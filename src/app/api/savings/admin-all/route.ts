import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const entries = await (prisma as any).savingsEntry.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const memberSummary: Record<string, { count: number; accounts: string[]; lastPush: string }> = {};
  for (const e of entries) {
    const email = e.memberEmail;
    if (!memberSummary[email]) memberSummary[email] = { count: 0, accounts: [], lastPush: e.uploadedAt };
    memberSummary[email].count++;
    if (e.accountNo && !memberSummary[email].accounts.includes(e.accountNo)) {
      memberSummary[email].accounts.push(e.accountNo);
    }
    if (new Date(e.uploadedAt) > new Date(memberSummary[email].lastPush)) {
      memberSummary[email].lastPush = e.uploadedAt;
    }
  }

  return NextResponse.json({ entries, memberSummary });
}
