import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApi } from "@/lib/auth-guard";
import { hashAdminPassword } from "@/lib/admin-auth";

// ─────────────────────────────────────────────
// PATCH  /api/admin/admins/[id] — edit an admin's info, or reset their
//                                  password, or activate/deactivate them
// DELETE /api/admin/admins/[id] — permanently remove an admin account
//
// Restricted to SUPER_ADMIN_CLERK_IDS.
// ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdminApi();
  if (error) return error;

  const { id } = await params;
  const account = await prisma.adminAccount.findUnique({ where: { id } });
  if (!account) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const data: {
    email?: string;
    fullName?: string;
    isActive?: boolean;
    passwordHash?: string;
  } = {};
  const userData: { email?: string; fullName?: string } = {};

  if (typeof body?.fullName === "string" && body.fullName.trim()) {
    data.fullName = body.fullName.trim();
    userData.fullName = data.fullName;
  }

  if (typeof body?.email === "string" && body.email.trim()) {
    const email = body.email.trim().toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (email !== account.email) {
      const [emailTakenByAdmin, emailTakenByUser] = await Promise.all([
        prisma.adminAccount.findUnique({ where: { email } }),
        prisma.user.findUnique({ where: { email } }),
      ]);
      if (emailTakenByAdmin || emailTakenByUser) {
        return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
      }
    }
    data.email = email;
    userData.email = email;
  }

  if (typeof body?.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  if (typeof body?.password === "string" && body.password.length > 0) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    data.passwordHash = await hashAdminPassword(body.password);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.adminAccount.update({ where: { id }, data });
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: account.linkedUserId }, data: userData });
    }
    return updatedAccount;
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    isActive: updated.isActive,
    lastLoginAt: updated.lastLoginAt,
    createdAt: updated.createdAt,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdminApi();
  if (error) return error;

  const { id } = await params;
  const account = await prisma.adminAccount.findUnique({ where: { id } });
  if (!account) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.adminAccount.delete({ where: { id } });
    // Best-effort — if this admin has related records elsewhere (chats,
    // reviewed documents, etc.) that use a required relation, this delete
    // can fail; the AdminAccount itself is already gone either way so the
    // admin can no longer log in.
    await tx.user.delete({ where: { id: account.linkedUserId } }).catch(() => null);
  });

  return NextResponse.json({ success: true });
}
