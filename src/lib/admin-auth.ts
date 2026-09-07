import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// ─────────────────────────────────────────────
// Admin session cookie
//
// Super-admin-created admins don't have a Clerk account — they log in with
// an email + password against the AdminAccount table. This issues them a
// signed, httpOnly session cookie instead. jose is used (not
// jsonwebtoken) because this token is also verified inside
// src/middleware.ts, which runs on the Edge runtime.
//
// Set ADMIN_SESSION_SECRET in your .env for production. Falls back to
// CLERK_SECRET_KEY, then a dev-only default, so this doesn't hard-crash
// local setups that haven't added the new var yet — but you should set
// your own secret before creating any real admin accounts.
// ─────────────────────────────────────────────

export const ADMIN_SESSION_COOKIE_NAME = "ludeva_admin_session";
const SESSION_DURATION = "7d";

function getSecretKey() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "dev-only-insecure-fallback-secret-set-ADMIN_SESSION_SECRET";
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  adminAccountId: string;
  userId: string;
  email: string;
}

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function signAdminSessionToken(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/**
 * Verifies an admin session token. Safe to call from Edge middleware.
 * Returns null on any invalid/expired/malformed token instead of throwing.
 */
export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.adminAccountId === "string" &&
      typeof payload.userId === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        adminAccountId: payload.adminAccountId,
        userId: payload.userId,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}
