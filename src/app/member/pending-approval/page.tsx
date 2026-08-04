import { redirect } from "next/navigation";
import { getCurrentUserFromDB } from "@/lib/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert, ShieldCheck, MessageCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import PendingApprovalPoller from "./PendingApprovalPoller";

export default async function PendingApprovalPage() {
  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");

  // Nothing to wait for — send already-approved members straight to their
  // dashboard instead of stranding them on this page.
  if (user.onboardingCompleted && user.kycStatus === "APPROVED") {
    redirect("/member/dashboard");
  }
  if (!user.onboardingCompleted) {
    redirect("/onboarding/investment");
  }

  const isRejected = user.kycStatus === "REJECTED";

  return (
    <div className="max-w-xl mx-auto py-10 sm:py-16 px-4">
      <PendingApprovalPoller />
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 sm:p-10 text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
              isRejected
                ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isRejected ? <ShieldAlert className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            {isRejected ? "Verification Not Approved" : "Your Account Is Under Review"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {isRejected ? (
              <>
                Our team reviewed your submitted details and could not approve your account as
                submitted. This is usually because a document was unclear, incomplete, or didn't
                match your details. Please contact support so we can guide you through resubmitting.
              </>
            ) : (
              <>
                Thanks for completing your application, {user.fullName || "there"}. For everyone's
                security, a Ludeva team member reviews and verifies every new account before it gets
                full access to the investor portal. This usually takes <strong>1–2 business days</strong>.
                We'll notify you here and by email the moment you're approved.
              </>
            )}
          </p>

          <div className="grid gap-3 text-left bg-muted/40 rounded-xl p-4 mb-6 text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Application submitted</span>
            </div>
            <div className="flex items-center gap-3">
              {isRejected ? (
                <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
              )}
              <span>{isRejected ? "Not approved — action needed" : "Awaiting admin verification"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/member/chat" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Support
              </Button>
            </Link>
            <Link href="/member/profile" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                View My Details
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <RefreshCw className="h-3 w-3" />
            This page updates automatically once you're approved — no need to keep refreshing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
