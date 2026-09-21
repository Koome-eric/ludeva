'use client';

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { PostSignupRedirect } from "@/components/PostSignupRedirect";

/**
 * Sign-In Page
 * 
 * After successful sign-in, PostSignupRedirect checks:
 * - If user is onboarded → dashboard
 * - If not onboarded → onboarding page
 *
 * This is the Clerk-authenticated sign-in for members (and the two
 * hardcoded super admins). Admins created via the "Admin Users" panel have
 * an email + password only — no Clerk account — so entering those
 * credentials here won't find a match; the link below sends them to the
 * right page (/admin/login) instead of them ending up stuck signing up
 * for a brand-new member account.
 */
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <SignIn />
      <p className="text-sm text-muted-foreground">
        Signing in as an admin?{" "}
        <Link href="/admin/login" className="font-medium underline underline-offset-4">
          Sign in here
        </Link>
      </p>
      <PostSignupRedirect />
    </div>
  );
}