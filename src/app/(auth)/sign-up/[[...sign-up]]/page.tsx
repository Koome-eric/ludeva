'use client';

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
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SignUp 
        path="/sign-up"
        // No static redirect - PostSignupRedirect handles it
        fallbackRedirectUrl="/onboarding/investment"
      />
      <PostSignupRedirect />
    </div>
  );
}
