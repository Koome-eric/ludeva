import { auth } from "@clerk/nextjs/server";
import { requireAdmin, SUPER_ADMIN_CLERK_IDS } from "@/lib/auth-guard";
import { AdminUsersClient } from "./AdminUsersClient";

// Gates the page like any other /admin/* page (Clerk super admin/admin,
// or a super-admin-created admin account session — see requireAdmin()).
// Whether the *create/edit/delete* controls are shown is decided here,
// server-side, from the real Clerk super admin list — never trust a
// client-side flag for that, since the API routes are the real
// enforcement but the UI shouldn't dangle buttons that will just 403.
export default async function AdminUsersPage() {
  await requireAdmin();
  const { userId: clerkId } = await auth();
  const isSuperAdmin = Boolean(clerkId && SUPER_ADMIN_CLERK_IDS.includes(clerkId));

  return <AdminUsersClient isSuperAdmin={isSuperAdmin} />;
}
