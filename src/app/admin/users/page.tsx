"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserCog } from "lucide-react";

// Socket.IO client
import io from "socket.io-client";

interface Admin {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status: "Active" | "Inactive";
}

let socket: any;

export default function AdminsPage() {
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Socket.IO client once
    if (!socket) {
      socket = io(); // assumes same origin
    }

    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admins");
        const data: Admin[] = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();

    // ---------------- Real-time subscription ----------------
    socket.on("admin:new", (newAdmin: Admin) => {
      setAdmins((prev) => [newAdmin, ...prev]);
    });

    socket.on("admin:update", (updatedAdmin: Admin) => {
      setAdmins((prev) =>
        prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a))
      );
    });

    socket.on("admin:delete", (deletedAdmin: Admin) => {
      setAdmins((prev) => prev.filter((a) => a.id !== deletedAdmin.id));
    });

    return () => {
      socket.off("admin:new");
      socket.off("admin:update");
      socket.off("admin:delete");
    };
  }, []);

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (admin.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (admin.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (
    id: string,
    newRole: string,
    toggleStatus?: boolean
  ) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;

    const updated = await fetch(`/api/admins/${id}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: newRole,
        onboardingCompleted:
          toggleStatus !== undefined ? toggleStatus : admin.status === "Active",
      }),
    }).then((res) => res.json());

    // Optimistic update handled via Socket.IO anyway
    setAdmins((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserCog className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Admin Users</h1>
            <p className="text-muted-foreground">
              Manage all administrators and their roles
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading admin users...</p>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">{admin.name ?? "Unknown"}</td>
                    <td className="p-4">{admin.email ?? "Unknown"}</td>

                    {/* Role dropdown */}
                    <td className="p-4">
                      <select
                        value={admin.role ?? "Admin"}
                        onChange={(e) => handleUpdate(admin.id, e.target.value)}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </td>

                    {/* Status toggle */}
                    <td className="p-4">
                      <Badge
                        className={
                          admin.status === "Active"
                            ? "bg-green-600 cursor-pointer"
                            : "bg-red-600 cursor-pointer"
                        }
                        onClick={() =>
                          handleUpdate(admin.id, admin.role ?? "Admin", admin.status !== "Active")
                        }
                      >
                        {admin.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert("Edit functionality coming soon")}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-muted-foreground">
                      No admin users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}