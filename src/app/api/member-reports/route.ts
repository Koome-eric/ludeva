// src/app/api/member-reports/route.ts
// Receives MMF performance data pushed from Google Sheets App Script
// Also serves member's own report data

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const SHEETS_API_SECRET = process.env.SHEETS_API_SECRET || "ludeva-sheets-secret-2025";

// ─────────────────────────────────────────────────
// GET — Member fetches their own report rows
// ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Match by email (the unique identifier used in the sheet)
  const reports = await (prisma as any).memberReport.findMany({
    where: { memberEmail: dbUser.email },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ reports, member: { email: dbUser.email, fullName: dbUser.fullName } });
}

// ─────────────────────────────────────────────────
// POST — Google Sheets App Script pushes rows here
// ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Validate the shared secret header
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
      principal,
      rate,
      roi,
      withdrawal,
      closingBal,
      quarter,
      notes,
      periodLabel,
    } = row;

    if (!memberEmail) {
      results.push({ error: "memberEmail required", row });
      continue;
    }

    // Upsert: match by email + date + accountNo so re-pushing a row updates rather than duplicates
    const where = {
      // MongoDB doesn't support compound unique in this way without @@unique
      // So we use findFirst + upsert pattern
    };

    const existing = await (prisma as any).memberReport.findFirst({
      where: {
        memberEmail: memberEmail.toLowerCase().trim(),
        date: date || null,
        accountNo: accountNo || null,
      },
    });

    const data = {
      memberEmail: memberEmail.toLowerCase().trim(),
      accountNo: accountNo?.trim() || null,
      memberName: memberName?.trim() || null,
      date: date?.trim() || null,
      principal: principal?.toString()?.trim() || null,
      rate: rate?.toString()?.trim() || null,
      roi: roi?.toString()?.trim() || null,
      withdrawal: withdrawal?.toString()?.trim() || null,
      closingBal: closingBal?.toString()?.trim() || null,
      quarter: quarter?.toString()?.trim() || null,
      notes: notes?.toString()?.trim() || null,
      periodLabel: periodLabel?.toString()?.trim() || null,
    };

    let record;
    if (existing) {
      record = await (prisma as any).memberReport.update({
        where: { id: existing.id },
        data,
      });
    } else {
      record = await (prisma as any).memberReport.create({ data });
    }

    results.push({ success: true, id: record.id, email: memberEmail });
  }

  return NextResponse.json({ processed: results.length, results });
}

// ─────────────────────────────────────────────────
// DELETE — Admin can wipe a member's reports by email
// ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("x-sheets-secret");
  if (authHeader !== SHEETS_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const result = await (prisma as any).memberReport.deleteMany({
    where: { memberEmail: email.toLowerCase().trim() },
  });

  return NextResponse.json({ deleted: result.count });
}
