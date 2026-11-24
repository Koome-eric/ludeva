import { Eye } from "lucide-react";
import { requireModulePage } from "@/lib/auth-guard";
import type { PermissionModule } from "@/lib/permissions";
import { ViewOnlyShield } from "./ViewOnlyShield";

// Server-side gate used by each admin section's layout.tsx. Admins with no
// access are redirected to the dashboard; admins with view-only access get
// the page plus a banner (the APIs/actions behind it also refuse edits).
export async function ModuleGate({
  module,
  children,
}: {
  module: PermissionModule;
  children: React.ReactNode;
}) {
  const access = await requireModulePage(module, "view");
  const viewOnly = !access.isSuperAdmin && access.permissions[module] !== "edit";

  return (
    <>
      {viewOnly && <ViewOnlyShield />}
      {viewOnly && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            View-only access — you can look at this section but changes you try to make will be
            refused. Ask a super admin if you need edit access.
          </span>
        </div>
      )}
      {children}
    </>
  );
}
