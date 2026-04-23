"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell } from "lucide-react";
import { format } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with your account activity.
        </p>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Loading notifications...
                  </TableCell>
                </TableRow>
              ) : notifications.length ? (
                notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{n.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{n.type}</TableCell>

                    <TableCell>
                      {format(new Date(n.createdAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    No notifications yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}