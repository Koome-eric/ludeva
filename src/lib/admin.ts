// NOTE: unused elsewhere in the app as of this writing, but kept correct
// in case something starts importing it. The canonical list — both real
// super admin IDs — lives in src/lib/auth-guard.ts (SUPER_ADMIN_CLERK_IDS);
// mirrored here as a single constant only because this file's shape
// (one ID + isSuperAdmin(user)) predates the second super admin.
import { SUPER_ADMIN_CLERK_IDS } from "./auth-guard";

export const SUPER_ADMIN_CLERK_ID = SUPER_ADMIN_CLERK_IDS[0];

export function isSuperAdmin(user: any) {
  return Boolean(user?.clerkId && SUPER_ADMIN_CLERK_IDS.includes(user.clerkId));
}