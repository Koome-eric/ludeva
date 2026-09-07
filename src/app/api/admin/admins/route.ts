import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApi, SUPER_ADMIN_CLERK_IDS } from "@/lib/auth-guard";
import { hashAdminPassword } from "@/lib/admin-auth";

// ─────────────────────────────────────────────
// GET  /api/admin/admins      — list all admins: the hardcoded Clerk super
//                                admins plus every super-admin-created
//                                AdminAccount
// POST /api/admin/admins      — create a new admin account (email + password)
//
// Restricted to SUPER_ADMIN_CLERK_IDS. The two hardcoded super admins
// (middleware.ts / auth-guard.ts) aren't AdminAccount rows — they're
// surfaced here by reading their linked `User` rows and flagged with
// isSuperAdmin so the UI can hide edit/delete (those routes only know how
// to mutate AdminAccount rows, not the hardcoded Clerk IDs).
// ─────────────────────────────────────────────

export async function GET() {
  const { error } = await requireSuperAdminApi();
  if (error) return error;

  const [superAdminUsers, admins] = await Promise.all([
    prisma.user.findMany({
      where: { clerkId: { in: SUPER_ADMIN_CLERK_IDS } },
    }),
    prisma.adminAccount.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const superAdmins = superAdminUsers.map((u) => ({
    id: `clerk_${u.clerkId}`,
    email: u.email,
    fullName: u.fullName || "Super Admin",
    isActive: true,
    // Not tracked in the DB for Clerk-authenticated super admins — they
    // sign in through Clerk directly, not the admin_account login flow.
    lastLoginAt: null,
    createdAt: u.createdAt,
    isSuperAdmin: true as const,
  }));

  const createdAdmins = admins.map((a) => ({
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt,
    createdAt: a.createdAt,
    isSuperAdmin: false as const,
  }));

  return NextResponse.json([...superAdmins, ...createdAdmins]);
}

export async function POST(req: NextRequest) {
  const { clerkId, error } = await requireSuperAdminApi();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existingAdminAccount = await prisma.adminAccount.findUnique({ where: { email } });
  if (existingAdminAccount) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already in use by another account" },
      { status: 409 }
    );
  }

  const passwordHash = await hashAdminPassword(password);

  // Create the linked User row first — the rest of the admin panel reads
  // `User` records, so this is what makes the created admin show up
  // everywhere (assignee dropdowns, activity logs, etc.) exactly like a
  // Clerk-authenticated admin. clerkId is required+unique on User but this
  // admin never has one, so we use a synthetic, clearly-marked value.
  // Wrapped in a transaction so a failure partway through never leaves an
  // orphaned User or AdminAccount behind.
  const { adminAccount, finalUser } = await prisma.$transaction(async (tx) => {
    const linkedUser = await tx.user.create({
      data: {
        // Temporary unique placeholder — replaced with a stable
        // `admin_account_<id>` value right after the AdminAccount is
        // created below. Randomized so concurrent creations never collide
        // on the required-unique clerkId field.
        clerkId: `admin_account_pending_${crypto.randomUUID()}`,
        email,
        fullName,
        role: "ADMIN",
        onboardingCompleted: true,
        kycStatus: "APPROVED",
      },
    });

    const adminAccount = await tx.adminAccount.create({
      data: {
        email,
        passwordHash,
        fullName,
        createdByClerkId: clerkId!,
        linkedUserId: linkedUser.id,
      },
    });

    const finalUser = await tx.user.update({
      where: { id: linkedUser.id },
      data: { clerkId: `admin_account_${adminAccount.id}` },
    });

    return { adminAccount, finalUser };
  });

  return NextResponse.json(
    {
      id: adminAccount.id,
      email: adminAccount.email,
      fullName: adminAccount.fullName,
      isActive: adminAccount.isActive,
      createdAt: adminAccount.createdAt,
      userId: finalUser.id,
    },
    { status: 201 }
  );
}
