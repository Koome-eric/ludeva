// src/app/api/admin/dashboard/route.ts
//
// Polled by the admin dashboard (every ~15s while the tab is visible) to keep
// the platform overview live. Admin-only; never cached by the browser or CDN.

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-guard";
import { getAdminDashboardSnapshot } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const snapshot = await getAdminDashboardSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("[api/admin/dashboard] failed:", err);
    return NextResponse.json({ error: "Failed to load dashboard analytics" }, { status: 500 });
  }
}
