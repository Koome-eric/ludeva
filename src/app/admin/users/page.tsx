import { requireAdmin } from "@/lib/auth-guard";
import { AdminUsersClient } from "./AdminUsersClient";

// Gates the page like any other /admin/* page (Clerk super admin/admin,
// or a super-admin-created admin account session — see requireAdmin()).
// Every admin gets the same panel here, including the ability to manage
// other admins — there's no separate super-admin-only view anymore.
export default async function AdminUsersPage() {
  await requireAdmin();

  return <AdminUsersClient />;
}
