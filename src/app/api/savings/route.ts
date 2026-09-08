// src/app/api/savings/route.ts
// Receives Savings Data pushed from Google Sheets App Script.
// Also serves a member's own savings entries.
// Mirrors src/app/api/member-reports/route.ts, against SavingsEntry
// instead of MemberReport — Savings uses a running-balance formula
// (opening balance + deposit - withdrawal + interest) rather than
// Investments' per-transaction principal x rate.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const SHEETS_API_SECRET = process.env.SAVINGS_SHEETS_API_SECRET || process.env.SHEETS_API_SECRET || "ludeva-sheets-secret-2025";

// ─────────────────────────────────────────────────
// GET — Member fetches their own savings entries
// ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entries = await (prisma as any).savingsEntry.findMany({
    where: { memberEmail: dbUser.email },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ entries, member: { email: dbUser.email, fullName: dbUser.fullName } });
}

// ─────────────────────────────────────────────────
// POST — Google Sheets App Script pushes Savings Data rows here
// ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-sheets-secret");
  if (authHeader !== SHEETS_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Body can be a single row object OR an array of rows
  const rows: any[] = Array.isArray(body) ? body : [body];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const results: any[] = [];

  for (const row of rows) {
    const {
      memberEmail,
      accountNo,
      memberName,
      date,
      openingBalance,
      deposit,
      withdrawal,
      monthlyRate,
      interestEarned,
      closingBalance,
      periodLabel,
      notes,
    } = row;

    if (!memberEmail) {
      results.push({ error: "memberEmail required", row });
      continue;
    }

    // Upsert: match by email + date + accountNo so re-pushing a row updates rather than duplicates
    const existing = await (prisma as any).savingsEntry.findFirst({
      where: {
        memberEmail: memberEmail.toLowerCase().trim(),
        date: date || null,
        accountNo: accountNo || null,
      },
    });

    const data = {
      memberEmail: memberEmail.toLowerCase().trim(),
      accountNo: accountNo?.toString()?.trim() || null,
      memberName: memberName?.toString()?.trim() || null,
      date: date?.toString()?.trim() || null,
      openingBalance: openingBalance?.toString()?.trim() || null,
      deposit: deposit?.toString()?.trim() || null,
      withdrawal: withdrawal?.toString()?.trim() || null,
      monthlyRate: monthlyRate?.toString()?.trim() || null,
      interestEarned: interestEarned?.toString()?.trim() || null,
      closingBalance: closingBalance?.toString()?.trim() || null,
      periodLabel: periodLabel?.toString()?.trim() || null,
      notes: notes?.toString()?.trim() || null,
    };

    let record;
    if (existing) {
      record = await (prisma as any).savingsEntry.update({
        where: { id: existing.id },
        data,
      });
    } else {
      record = await (prisma as any).savingsEntry.create({ data });
    }

    results.push({ success: true, id: record.id, email: memberEmail });
  }

  return NextResponse.json({ processed: results.length, results });
}

// ─────────────────────────────────────────────────
// DELETE — Admin can wipe a member's savings entries by email
// ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("x-sheets-secret");
  if (authHeader !== SHEETS_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const result = await (prisma as any).savingsEntry.deleteMany({
    where: { memberEmail: email.toLowerCase().trim() },
  });

  return NextResponse.json({ deleted: result.count });
}
