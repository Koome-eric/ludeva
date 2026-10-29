'use client';

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
import { PostSignupRedirect } from "@/components/PostSignupRedirect";
import { clerkAppearance } from "@/lib/clerk-appearance";

/**
 * Sign-Up Page
 * 
 * This page handles the Clerk sign-up flow with dynamic redirect logic.
 * 
 * Flow:
 * 1. User fills out sign-up form
 * 2. Clerk creates account
 * 3. PostSignupRedirect component runs
 * 4. Checks if user exists in database
 * 5. Routes to onboarding (new) or dashboard (existing but not onboarded)
 * 6. After onboarding: Creates record in MongoDB
 * 7. Updates Clerk metadata (onboardingCompleted = true)
 * 8. Redirects to /member/dashboard
 */
export default function Page() {
  return (
    <AuthShell
      headline="Start building your wealth."
      subline="Create your Ludeva account, then complete a short onboarding to begin investing."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>
          <span className="mx-2">·</span>
          Admin?{" "}
          <Link href="/admin/login" className="font-medium text-primary underline underline-offset-4">
            Sign in here
          </Link>{" "}
        </>
      }
    >
      <SignUp
        path="/sign-up"
        // No static redirect - PostSignupRedirect handles it
        fallbackRedirectUrl="/onboarding/investment"
        appearance={clerkAppearance}
      />
      <PostSignupRedirect />
    </AuthShell>
  );
}
