"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendingApprovalPoller() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/member/kyc-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.onboardingCompleted && data.kycStatus === "APPROVED") {
          router.push("/member/dashboard");
          router.refresh();
        } else {
          // Rejected status can change too (e.g. re-approved after resubmission)
          // — refresh so the page reflects the current status either way.
          router.refresh();
        }
      } catch {
        // Silent — this is a background convenience check, not critical path.
      }
    };

    const interval = setInterval(check, 20000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
