import { requireSuperAdminPage } from "@/lib/auth-guard";

// Admin accounts, their permissions and the admin activity log are visible
// to super admins only.
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSuperAdminPage();
  return <>{children}</>;
}
