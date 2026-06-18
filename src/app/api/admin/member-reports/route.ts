// src/app/api/admin/member-reports/route.ts
// Lets an authenticated admin add, update, or delete a single MemberReport
// row directly from the admin dashboard (no Google Sheets secret needed).
// This is what powers "Add Investment Entry" on the admin member-reports UI.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

interface ReportRowInput {
  memberEmail: string;
  accountNo?: string;
  memberName?: string;
  date?: string;
  principal?: string | number;
  rate?: string | number;
  roi?: string | number;
  withdrawal?: string | number;
  closingBal?: string | number;
  quarter?: string;
  notes?: string;
  periodLabel?: string;
}

function normalizeRow(row: ReportRowInput) {
  return {
    memberEmail: row.memberEmail.toLowerCase().trim(),
    accountNo: row.accountNo?.trim() || null,
    memberName: row.memberName?.trim() || null,
    date: row.date?.trim() || null,
    principal: row.principal !== undefined && row.principal !== "" ? String(row.principal).trim() : null,
    rate: row.rate !== undefined && row.rate !== "" ? String(row.rate).trim() : null,
    roi: row.roi !== undefined && row.roi !== "" ? String(row.roi).trim() : null,
    withdrawal: row.withdrawal !== undefined && row.withdrawal !== "" ? String(row.withdrawal).trim() : null,
    closingBal: row.closingBal !== undefined && row.closingBal !== "" ? String(row.closingBal).trim() : null,
    quarter: row.quarter?.trim() || null,
    notes: row.notes?.trim() || null,
    periodLabel: row.periodLabel?.trim() || null,
  };
}

// POST — create a new report row (an investment entry) for a member.
export async function POST(req: NextRequest) {
  await requireAdmin();

  let body: ReportRowInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.memberEmail) {
    return NextResponse.json({ error: "memberEmail is required" }, { status: 400 });
  }
  if (!body.principal && !body.closingBal) {
    return NextResponse.json(
      { error: "Provide at least a principal or closing balance amount" },
      { status: 400 }
    );
  }

  const data = normalizeRow(body);

  const record = await (prisma as any).memberReport.create({ data });

  return NextResponse.json({ success: true, record });
}

// PATCH — update an existing report row by id.
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  let body: ReportRowInput & { id?: string };
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

  const record = await (prisma as any).memberReport.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json({ success: true, record });
}

// DELETE — remove a single report row by id (?id=...).
export async function DELETE(req: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await (prisma as any).memberReport.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
