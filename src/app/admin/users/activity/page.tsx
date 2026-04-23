"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Activity } from "lucide-react";

interface ActivityLog {
  id: string;
  user: string; // Admin or member
  action: string;
  date: string;
  status: "Success" | "Failed";
}

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set<string>());

  // Initial fetch + real-time subscription
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/activities");
        const data: ActivityLog[] = await res.json();
        data.forEach((a) => a.id && seenIds.current.add(a.id));
        setActivities(data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    if (typeof window !== "undefined" && (window as any).socket) {
      const socket = (window as any).socket;

      const handler = (activity: ActivityLog) => {
        if (!activity?.id) return;
        if (seenIds.current.has(activity.id)) return;

        seenIds.current.add(activity.id);
        setActivities((prev) => [activity, ...prev]);
      };

      socket.on("admin:activity:new", handler);
      return () => socket.off("admin:activity:new", handler);
    }
  }, []);

  const filteredActivity = activities.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Admin Activity</h1>
            <p className="text-muted-foreground">
              Track all administrator and member actions
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or action"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Activity Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-6 text-center text-muted-foreground">
              Loading activity logs...
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.map((log) => (
                  <tr key={log.id} className="border-b last:border-none">
                    <td className="p-4 font-medium">{log.user}</td>
                    <td className="p-4">{log.action}</td>
                    <td className="p-4">{new Date(log.date).toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={
                          log.status === "Success"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredActivity.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-muted-foreground"
                    >
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}