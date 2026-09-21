'use client';

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { PostSignupRedirect } from "@/components/PostSignupRedirect";

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
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
      <SignUp 
        path="/sign-up"
        // No static redirect - PostSignupRedirect handles it
        fallbackRedirectUrl="/onboarding/investment"
      />
      <p className="text-sm text-muted-foreground">
        Were you given an admin login?{" "}
        <Link href="/admin/login" className="font-medium underline underline-offset-4">
          Sign in here
        </Link>{" "}
        instead of signing up.
      </p>
      <PostSignupRedirect />
    </div>
  );
}
