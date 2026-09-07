// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "./lib/admin-auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/about/teams",
  "/about/blog",
  "/about/blog/:id*",
  "/about/directors",
  "/mmf",
  "/gallery",
  "/services/documents",
  "/services/music",
  "/stocks-bonds",
  "/upcoming/agribusiness",
  "/upcoming/real-estate",
  "/upcoming/sme-funding",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin/login",
  "/api/documents(.*)",
  "/api/creator",
  "/api/upload-kyc-doc",
  "/api/member-reports",
  "/api/admin/investments",
  "/api/admin/login",
  "/api/admin/logout",
  "/team/invite/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin/(.*)"]);
const isMemberRoute = createRouteMatcher(["/member/(.*)"]);

const SUPER_ADMIN_CLERK_IDS = [
  "user_3HXA2IEixF5gsA8QUNz0bzvk7B2",
  "user_3HXCbicqEmKShQGMcqzCKQBtNcw",
];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId) {
    // No Clerk session. For /admin/* routes, a super-admin-created admin
    // may still have a valid custom admin-session cookie (issued at
    // /admin/login — see src/lib/admin-auth.ts) — check that before
    // bouncing to Clerk's sign-in, since these admins never sign in
    // through Clerk at all.
    if (isAdminRoute(req)) {
      const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
      const session = token ? await verifyAdminSessionToken(token) : null;

      if (session) {
        return NextResponse.next();
      }

      if (!isPublicRoute(req)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } else if (!isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  if (userId) {
    if (SUPER_ADMIN_CLERK_IDS.includes(userId)) {
      if (isMemberRoute(req)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    const role = req.headers.get("x-clerk-role") || "";

    if (isAdminRoute(req) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/member/dashboard", req.url));
    }

    if (isMemberRoute(req) && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)" ],
};
