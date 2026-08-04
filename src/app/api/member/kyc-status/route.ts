import { NextResponse } from "next/server";
import { getCurrentUserFromDB } from "@/lib/user";

// Lightweight polling endpoint for the pending-approval page — avoids
// making the member manually refresh to find out they've been approved.
export async function GET() {
  const user = await getCurrentUserFromDB();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    onboardingCompleted: user.onboardingCompleted,
    kycStatus: user.kycStatus,
  });
}
