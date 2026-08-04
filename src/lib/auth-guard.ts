import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';

// ─────────────────────────────────────────────
// Super admin Clerk IDs — single source of truth
// (mirrors middleware.ts)
// ─────────────────────────────────────────────
export const SUPER_ADMIN_CLERK_IDS = [
  'user_38qCNW1RIEGrQ6rORph6s2348NX',
  'user_3B9OSNbtBdz7tP5pghbHX2FvQDp',
];

// ─────────────────────────────────────────────
// requireOnboardingComplete
// Use in: member dashboard pages
//
// Gates on BOTH onboarding form completion AND admin KYC approval.
// Completing the onboarding form only means the applicant submitted their
// data/documents — it does not mean an admin has reviewed and approved
// them. Without the kycStatus check below, anyone who filled the form got
// immediate full portal access regardless of review status, which is the
// exact gap that let unverified sign-ups reach the member portal.
// ─────────────────────────────────────────────
export async function requireOnboardingComplete() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) redirect('/onboarding/investment');
  if (!user.onboardingCompleted) redirect('/onboarding/investment');
  if (user.kycStatus !== 'APPROVED') redirect('/member/pending-approval');

  return user;
}

// ─────────────────────────────────────────────
// requireApprovedMember
// Use in: any member page exposing financial data (investments,
// transactions, reports, etc.) whose auth currently goes through
// getCurrentUserFromDB() instead of requireOnboardingComplete(). Call this
// right after fetching the user to add the same KYC gate.
// ─────────────────────────────────────────────
export function assertKycApproved(user: { onboardingCompleted: boolean; kycStatus: string } | null) {
  if (!user) redirect('/sign-in');
  if (!user.onboardingCompleted) redirect('/onboarding/investment');
  if (user.kycStatus !== 'APPROVED') redirect('/member/pending-approval');
}

// ─────────────────────────────────────────────
// getCurrentUserIfOnboarded
// Use in: optional auth (non-blocking)
// ─────────────────────────────────────────────
export async function getCurrentUserIfOnboarded() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user || !user.onboardingCompleted) return null;

  return user;
}

// ─────────────────────────────────────────────
// isUserAdmin
// Use in: conditional rendering, checks
// ─────────────────────────────────────────────
export async function isUserAdmin(): Promise<boolean> {
  const { userId: clerkId } = await auth();

  if (!clerkId) return false;

  if (SUPER_ADMIN_CLERK_IDS.includes(clerkId)) return true;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

// ─────────────────────────────────────────────
// requireAdmin
// Use in: /admin/* pages
// ─────────────────────────────────────────────
export async function requireAdmin() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect('/sign-in');

  // Auto-sync super admin into DB
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user && SUPER_ADMIN_CLERK_IDS.includes(clerkId)) {
    // Super admin not yet in DB — this shouldn't happen normally
    // but handle it gracefully
    redirect('/sign-in');
  }

  if (!user || (user.role !== 'ADMIN' && !SUPER_ADMIN_CLERK_IDS.includes(clerkId))) {
    redirect('/member/dashboard');
  }

  // If super admin but not flagged as ADMIN in DB, upgrade them
  if (SUPER_ADMIN_CLERK_IDS.includes(clerkId) && user.role !== 'ADMIN') {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });
  }

  return user;
}

// ─────────────────────────────────────────────
// requireUser
// Use in: chat pages, general authenticated pages
// No onboarding or role restriction
// ─────────────────────────────────────────────
export async function requireUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    // User authenticated with Clerk but not yet in DB
    redirect('/onboarding/investment');
  }

  return user;
}

// ─────────────────────────────────────────────
// requireUserApi
// Use in: API routes (returns null instead of redirecting)
// ─────────────────────────────────────────────
export async function requireUserApi() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId } });

  return user ?? null;
}
// ─────────────────────────────────────────────
// requireAdminApi
// Use in: /api/admin/* routes (returns 401/403 instead of redirecting)
// redirect() in API routes throws NEXT_REDIRECT which bypasses try/catch
// and returns a 307 that the client fetch follows to HTML — breaking JSON.
// Always use this in API routes, not requireAdmin().
// ─────────────────────────────────────────────
export async function requireAdminApi(): Promise<
  { user: Awaited<ReturnType<typeof prisma.user.findUnique>>; error: null } |
  { user: null; error: NextResponse }
> {
  const { NextResponse } = await import("next/server");
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const isSuperAdmin = SUPER_ADMIN_CLERK_IDS.includes(clerkId);

  if (user.role !== "ADMIN" && !isSuperAdmin) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  // Auto-upgrade super admin role in DB if needed
  if (isSuperAdmin && user.role !== "ADMIN") {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
    return { user: updated, error: null };
  }

  return { user, error: null };
}
