"use client";

import NotificationsPageClient from "@/components/NotificationsPageClient";

export default function AdminNotificationsPage() {
  return (
    <NotificationsPageClient
      endpoint="/api/admin/notifications"
      subtitle="Platform activity — new investors, investments, KYC submissions, and internal alerts."
    />
  );
}
