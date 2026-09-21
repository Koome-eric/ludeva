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
    // No Clerk session. A super-admin-created admin may still have a
    // valid custom admin-session cookie (issued at /admin/login — see
    // src/lib/admin-auth.ts), since these admins never sign in through
    // Clerk at all. Checked for EVERY request here — not just /admin/*
    // page loads — because the admin dashboard's own data calls
    // (/api/admin/*, /api/member-reports/*, etc.) need the exact same
    // pass-through: those route handlers already know how to authenticate
    // an admin-session cookie via requireAdmin()/requireAdminApi() (see
    // src/lib/auth-guard.ts), so middleware just needs to stop redirecting
    // them away before they ever get there. Previously this check only
    // ran for paths matching isAdminRoute (/admin/(.*)), which never
    // matches an /api/... path — so every such fetch from an
    // admin-session-cookie admin fell through to the "not public, no
    // Clerk session" branch below and got redirected to /sign-in's HTML,
    // which is why those fetches failed to parse as JSON.
    const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminSessionToken(token) : null;

    if (session) {
      return NextResponse.next();
    }

    if (!isPublicRoute(req)) {
      // An API call with no session at all gets a plain JSON 401 instead
      // of being redirected to an HTML page — redirecting an API request
      // is what produced "Unexpected token '<'" errors in the browser
      // console, since fetch() follows the redirect and tries to parse
      // the resulting sign-in page as JSON.
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      if (isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
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
