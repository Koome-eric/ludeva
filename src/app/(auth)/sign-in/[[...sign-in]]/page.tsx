'use client';

import { SignIn } from "@clerk/nextjs";
import { PostSignupRedirect } from "@/components/PostSignupRedirect";

/**
 * Sign-In Page
 * 
 * After successful sign-in, PostSignupRedirect checks:
 * - If user is onboarded → dashboard
 * - If not onboarded → onboarding page
 */
export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn />
      <PostSignupRedirect />
    </div>
  );
}