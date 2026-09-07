import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE_NAME,
  signAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

// POST /api/admin/login — email + password login for admins created via
// the "Admin Users" panel. Public route (see src/middleware.ts).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const account = await prisma.adminAccount.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong, so this endpoint doesn't reveal which admin emails exist.
  const genericError = NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!account || !account.isActive) return genericError;

  const passwordMatches = await verifyAdminPassword(password, account.passwordHash);
  if (!passwordMatches) return genericError;

  const token = await signAdminSessionToken({
    adminAccountId: account.id,
    userId: account.linkedUserId,
    email: account.email,
  });

  await prisma.adminAccount.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches the token's own expiry
  });

  return response;
}
