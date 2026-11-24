import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminAccess, getAdminAccountSessionUser } from "@/lib/auth-guard";

// GET /api/admin/me — tells the admin-panel UI who is signed in and what
// they may do:
// - isSuperAdmin: can they manage other admins and their permissions?
// - permissions: { module: "none" | "view" | "edit" } — drives which
//   sidebar entries show and which buttons are enabled. (The server
//   re-checks every request; this is only for the UI.)
// - isAdminAccountSession: logged in via /admin/login (email+password)
//   rather than Clerk? (swaps Clerk's <UserButton> for a logout button)
export async function GET() {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: clerkId } = await auth();
  const sessionUser = clerkId ? null : await getAdminAccountSessionUser();

  return NextResponse.json({
    isSuperAdmin: access.isSuperAdmin,
    isAdminAccountSession: Boolean(sessionUser),
    permissions: access.permissions,
    email: access.user.email,
    fullName: access.user.fullName,
  });
}
