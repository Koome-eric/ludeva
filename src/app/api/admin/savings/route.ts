// src/app/api/admin/savings/route.ts
// Lets an authenticated admin add, update, or delete a single SavingsEntry
// row directly from the admin dashboard (no Google Sheets secret needed).
// This is what powers "Add Savings Entry" on the admin Savings Accounts UI.
// Mirrors src/app/api/admin/member-reports/route.ts.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

interface SavingsRowInput {
  memberEmail: string;
  accountNo?: string;
  memberName?: string;
  date?: string;
  openingBalance?: string | number;
  deposit?: string | number;
  withdrawal?: string | number;
  monthlyRate?: string | number;
  interestEarned?: string | number;
  closingBalance?: string | number;
  periodLabel?: string;
  notes?: string;
}

function normalizeRow(row: SavingsRowInput) {
  return {
    memberEmail: row.memberEmail.toLowerCase().trim(),
    accountNo: row.accountNo?.trim() || null,
    memberName: row.memberName?.trim() || null,
    date: row.date?.trim() || null,
    openingBalance: row.openingBalance !== undefined && row.openingBalance !== "" ? String(row.openingBalance).trim() : null,
    deposit: row.deposit !== undefined && row.deposit !== "" ? String(row.deposit).trim() : null,
    withdrawal: row.withdrawal !== undefined && row.withdrawal !== "" ? String(row.withdrawal).trim() : null,
    monthlyRate: row.monthlyRate !== undefined && row.monthlyRate !== "" ? String(row.monthlyRate).trim() : null,
    interestEarned: row.interestEarned !== undefined && row.interestEarned !== "" ? String(row.interestEarned).trim() : null,
    closingBalance: row.closingBalance !== undefined && row.closingBalance !== "" ? String(row.closingBalance).trim() : null,
    periodLabel: row.periodLabel?.trim() || null,
    notes: row.notes?.trim() || null,
  };
}

// POST — create a new savings entry for a member.
export async function POST(req: NextRequest) {
  await requireAdmin();

  let body: SavingsRowInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.memberEmail) {
    return NextResponse.json({ error: "memberEmail is required" }, { status: 400 });
  }
  if (!body.openingBalance && !body.closingBalance) {
    return NextResponse.json(
      { error: "Provide at least an opening or closing balance amount" },
      { status: 400 }
    );
  }

  const data = normalizeRow(body);

  const record = await (prisma as any).savingsEntry.create({ data });

  return NextResponse.json({ success: true, record });
}

// PATCH — update an existing savings entry by id.
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  let body: SavingsRowInput & { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (!body.memberEmail) {
    return NextResponse.json({ error: "memberEmail is required" }, { status: 400 });
  }

  const data = normalizeRow(body);

  const record = await (prisma as any).savingsEntry.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json({ success: true, record });
}

// DELETE — remove a single savings entry by id (?id=...).
export async function DELETE(req: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await (prisma as any).savingsEntry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
