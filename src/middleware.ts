// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  "/services/fixed-deposit",
  "/stocks-bonds",
  "/upcoming/agribusiness",
  "/upcoming/real-estate",
  "/upcoming/sme-funding",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // ✅ ADD THIS
  "/api/documents(.*)",
  "/api/creator", // ✅ allow your API
  "/api/upload-kyc-doc", // ✅ KYC document upload (auth checked inside)

]);

const isAdminRoute = createRouteMatcher(["/admin/(.*)"]);
const isMemberRoute = createRouteMatcher(["/member/(.*)"]);

// List of all super admin Clerk IDs
const SUPER_ADMIN_CLERK_IDS = [
  "user_38qCNW1RIEGrQ6rORph6s2348NX",
  "user_3B9OSNbtBdz7tP5pghbHX2FvQDp", // new super admin
];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Not signed in
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId) {
    // SUPER ADMIN
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
  matcher: [
    /*
     Run middleware on ALL routes except:
     - static files
     - Next internals
    */
    "/((?!_next|.*\\..*).*)",
  ],
};