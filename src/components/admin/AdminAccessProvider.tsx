"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  canAccess,
  fullPermissions,
  type AdminPermissionMap,
  type PermissionModule,
} from "@/lib/permissions";

// UI-only view of the signed-in admin's permissions (from /api/admin/me).
// Hiding/disabling controls here is a convenience — every API route and
// server action re-checks on the server.
interface AdminAccessValue {
  loaded: boolean;
  isSuperAdmin: boolean;
  permissions: AdminPermissionMap | null;
  canView: (m: PermissionModule) => boolean;
  canEdit: (m: PermissionModule) => boolean;
}

const AdminAccessContext = createContext<AdminAccessValue>({
  loaded: false,
  isSuperAdmin: false,
  permissions: null,
  canView: () => false,
  canEdit: () => false,
});

export function AdminAccessProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    loaded: boolean;
    isSuperAdmin: boolean;
    permissions: AdminPermissionMap | null;
  }>({ loaded: false, isSuperAdmin: false, permissions: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setState({
          loaded: true,
          isSuperAdmin: Boolean(data?.isSuperAdmin),
          permissions: data?.isSuperAdmin ? fullPermissions() : data?.permissions ?? null,
        });
      })
      .catch(() => !cancelled && setState({ loaded: true, isSuperAdmin: false, permissions: null }));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AdminAccessValue>(
    () => ({
      ...state,
      canView: (m) => state.isSuperAdmin || canAccess(state.permissions, m, "view"),
      canEdit: (m) => state.isSuperAdmin || canAccess(state.permissions, m, "edit"),
    }),
    [state]
  );

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

/** `const { canEdit } = useAdminAccess(); <Button disabled={!canEdit("savings")} />` */
export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
