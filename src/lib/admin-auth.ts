import bcrypt from "bcryptjs";

// Node-only admin auth helpers (password hashing for AdminAccount logins).
// Session/JWT helpers live in ./admin-session so Edge middleware can import
// them without pulling in bcryptjs.

export {
  ADMIN_SESSION_COOKIE_NAME,
  signAdminSessionToken,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "./admin-session";

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

