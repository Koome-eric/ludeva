"use client";

import { useEffect, useState } from "react";
import { UserCog, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  PERMISSION_MODULES,
  fullPermissions,
  normalizePermissions,
  type AdminPermissionMap,
  type PermissionLevel,
} from "@/lib/permissions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AdminAccount {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  // True for the two hardcoded Clerk super admins (surfaced from their
  // User row, not an AdminAccount row) — edit/delete don't apply to them.
  isSuperAdmin?: boolean;
  permissions?: AdminPermissionMap;
}

export function AdminUsersClient() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) {
        setListError("Failed to load admins.");
        setAdmins([]);
        return;
      }
      setAdmins(await res.json());
    } catch {
      setListError("Failed to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserCog className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Admin Users</h1>
            <p className="text-muted-foreground">
              Create and manage admin accounts. Created admins log in with
              their email and password at{" "}
              <span className="font-mono text-xs">/admin/login</span>.
            </p>
          </div>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Admin
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-10 text-center text-muted-foreground">
              Loading admins...
            </p>
          ) : listError ? (
            <p className="p-10 text-center text-muted-foreground">{listError}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.fullName}
                      {admin.isSuperAdmin && (
                        <Badge variant="outline" className="ml-2 align-middle">
                          Super Admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {admin.isSuperAdmin ? "Super admin — everything" : permissionsSummary(admin.permissions)}
                    </TableCell>
                    <TableCell>
                      <Badge className={admin.isActive ? "bg-green-600" : "bg-red-600"}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.isSuperAdmin
                        ? "—"
                        : admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {admin.isSuperAdmin ? (
                        <span className="text-xs text-muted-foreground">Not editable</span>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditing(admin)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleting(admin)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-10 text-center text-muted-foreground">
                      No admin accounts yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAdminDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(newAdmin) => setAdmins((prev) => [newAdmin, ...prev])}
      />

      <EditAdminDialog
        admin={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={(updated) =>
          setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
        }
      />

      <DeleteAdminDialog
        admin={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={(id) => setAdmins((prev) => prev.filter((a) => a.id !== id))}
      />
    </div>
  );
}

function CreateAdminDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (admin: AdminAccount) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<AdminPermissionMap>(() => fullPermissions());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPermissions(fullPermissions());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, permissions }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Failed to create admin");
        return;
      }

      onCreated({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        isActive: data.isActive,
        lastLoginAt: null,
        createdAt: data.createdAt,
        permissions: data.permissions,
      });
      reset();
      onOpenChange(false);
    } catch {
      setError("Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create admin account</DialogTitle>
            <DialogDescription>
              They'll be able to sign in at <span className="font-mono text-xs">/admin/login</span> with
              this email and password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-admin-name">Full name</Label>
              <Input
                id="new-admin-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-admin-email">Email</Label>
              <Input
                id="new-admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-admin-password">Password</Label>
              <Input
                id="new-admin-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>

            <PermissionsEditor value={permissions} onChange={setPermissions} />

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAdminDialog({
  admin,
  onOpenChange,
  onSaved,
}: {
  admin: AdminAccount | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (admin: AdminAccount) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [permissions, setPermissions] = useState<AdminPermissionMap>(() => fullPermissions());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setPermissions(normalizePermissions(admin.permissions));
      setFullName(admin.fullName);
      setEmail(admin.email);
      setIsActive(admin.isActive);
      setNewPassword("");
      setError(null);
    }
  }, [admin]);

  if (!admin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body: Record<string, unknown> = { fullName, email, isActive, permissions };
    if (newPassword) body.password = newPassword;

    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Failed to update admin");
        return;
      }

      onSaved(data);
      onOpenChange(false);
    } catch {
      setError("Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit admin</DialogTitle>
            <DialogDescription>
              Update {admin.fullName}'s info, deactivate their access, or reset their password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-admin-name">Full name</Label>
              <Input
                id="edit-admin-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-admin-email">Email</Label>
              <Input
                id="edit-admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-admin-password">New password (optional)</Label>
              <Input
                id="edit-admin-password"
                type="password"
                minLength={8}
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="edit-admin-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive admins can't log in, even with the correct password.
                </p>
              </div>
              <Switch id="edit-admin-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <PermissionsEditor value={permissions} onChange={setPermissions} />

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAdminDialog({
  admin,
  onOpenChange,
  onDeleted,
}: {
  admin: AdminAccount | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  if (!admin) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(admin.id);
        onOpenChange(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {admin.fullName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes their admin account and login access. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


const LEVEL_LABELS: Record<PermissionLevel, string> = {
  none: "No access",
  view: "View only",
  edit: "Can edit",
};

// One row per admin-panel section; pick No access / View only / Can edit.
function PermissionsEditor({
  value,
  onChange,
}: {
  value: AdminPermissionMap;
  onChange: (next: AdminPermissionMap) => void;
}) {
  const setAll = (level: PermissionLevel) =>
    onChange(
      Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, level])) as AdminPermissionMap
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Permissions</Label>
        <div className="flex gap-1 text-xs">
          <Button type="button" size="sm" variant="ghost" className="h-6 px-2" onClick={() => setAll("none")}>
            None
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-6 px-2" onClick={() => setAll("view")}>
            All view
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-6 px-2" onClick={() => setAll("edit")}>
            All edit
          </Button>
        </div>
      </div>
      <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-2">
        {PERMISSION_MODULES.map((m) => (
          <div key={m.key} className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-muted/50">
            <div className="min-w-0">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="truncate text-xs text-muted-foreground">{m.description}</p>
            </div>
            <select
              aria-label={`${m.label} access`}
              className="h-8 shrink-0 rounded-md border bg-background px-2 text-sm"
              value={value[m.key]}
              onChange={(e) => onChange({ ...value, [m.key]: e.target.value as PermissionLevel })}
            >
              {(Object.keys(LEVEL_LABELS) as PermissionLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {LEVEL_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        View-only admins can open a section and read it, but can't add, edit, approve or delete
        anything. Managing admins stays with super admins.
      </p>
    </div>
  );
}

function permissionsSummary(p?: AdminPermissionMap) {
  const perms = normalizePermissions(p);
  const vals = Object.values(perms);
  const edit = vals.filter((v) => v === "edit").length;
  const view = vals.filter((v) => v === "view").length;
  const none = vals.filter((v) => v === "none").length;
  if (edit === vals.length) return "Full access";
  return `${edit} edit · ${view} view · ${none} hidden`;
}
