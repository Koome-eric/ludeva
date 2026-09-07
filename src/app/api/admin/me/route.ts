import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SUPER_ADMIN_CLERK_IDS, getAdminAccountSessionUser } from "@/lib/auth-guard";

// GET /api/admin/me — tells the admin-panel UI:
// - isSuperAdmin: can they create/edit/delete other admins?
// - isAdminAccountSession: are they logged in via /admin/login (custom
//   email+password) rather than Clerk? (used to swap Clerk's <UserButton>
//   for a plain logout button in the admin layout)
export async function GET() {
  const { userId: clerkId } = await auth();

  if (clerkId) {
    return NextResponse.json({
      isSuperAdmin: SUPER_ADMIN_CLERK_IDS.includes(clerkId),
      isAdminAccountSession: false,
    });
  }

  const sessionUser = await getAdminAccountSessionUser();
  if (sessionUser) {
    return NextResponse.json({
      isSuperAdmin: false,
      isAdminAccountSession: true,
      email: sessionUser.email,
      fullName: sessionUser.fullName,
    });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
