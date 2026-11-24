import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

// Edge-safe admin session helpers (JWT cookie for AdminAccount logins).
// Kept separate from password hashing so middleware can import this module
// without pulling in Node-only dependencies like bcryptjs.
//
// See src/lib/admin-auth.ts for password hashing used on the Node server.

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
