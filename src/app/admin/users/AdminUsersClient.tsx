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
}

export function AdminUsersClient({ isSuperAdmin }: { isSuperAdmin: boolean }) {
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
        setListError(
          res.status === 403
            ? "Only super admins can view and manage admin accounts."
            : "Failed to load admins."
        );
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
    if (isSuperAdmin) {
      loadAdmins();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

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

        {isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Admin
          </Button>
        )}
      </div>

      {!isSuperAdmin ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Only the platform's super admins can create, edit, or delete
            admin accounts.
          </CardContent>
        </Card>
      ) : (
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
                      <TableCell colSpan={5} className="p-10 text-center text-muted-foreground">
                        No admin accounts yet. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
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
        body: JSON.stringify({ fullName, email, password }),
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
      <DialogContent>
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
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

    const body: Record<string, unknown> = { fullName, email, isActive };
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
      <DialogContent>
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
