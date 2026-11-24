import { requireSuperAdminPage } from "@/lib/auth-guard";
import { AdminUsersClient } from "./AdminUsersClient";

// Gates the page like any other /admin/* page (Clerk super admin/admin,
// or a super-admin-created admin account session — see requireAdmin()).
// Super admins only — they create admins and set each one's per-module permissions.
export default async function AdminUsersPage() {
  await requireSuperAdminPage();

  return <AdminUsersClient />;
}
