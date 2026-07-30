"use client";

import NotificationsPageClient from "@/components/NotificationsPageClient";

export default function NotificationsPage() {
  return (
    <NotificationsPageClient
      endpoint="/api/notifications"
      subtitle="Updates about your account — investments, payments, and KYC status."
    />
  );
}
