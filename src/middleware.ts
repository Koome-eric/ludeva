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
  "/stocks-bonds",
  "/upcoming/agribusiness",
  "/upcoming/real-estate",
  "/upcoming/sme-funding",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/documents(.*)",
  "/api/creator",
  "/api/upload-kyc-doc",
  "/api/member-reports",
  "/api/admin/investments",
]);

const isAdminRoute = createRouteMatcher(["/admin/(.*)"]);
const isMemberRoute = createRouteMatcher(["/member/(.*)"]);

const SUPER_ADMIN_CLERK_IDS = [
  "user_3HXA2IEixF5gsA8QUNz0bzvk7B2",
  "user_3B9OSNbtBdz7tP5pghbHX2FvQDp",
];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
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
