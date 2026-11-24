import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';
import {
  canAccess,
  fullPermissions,
  normalizePermissions,
  type AdminPermissionMap,
  type PermissionLevel,
  type PermissionModule,
} from './permissions';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from './admin-session';

// ─────────────────────────────────────────────
// Super admin Clerk IDs — single source of truth
// (mirrors middleware.ts)
// ─────────────────────────────────────────────
export const SUPER_ADMIN_CLERK_IDS = [
  'user_3HXA2IEixF5gsA8QUNz0bzvk7B2',
  'user_3HXCbicqEmKShQGMcqzCKQBtNcw',
];

// ─────────────────────────────────────────────
// getAdminAccountSessionUser
//
// Resolves the `ludeva_admin_session` cookie (set on login for
// super-admin-created AdminAccounts — see src/lib/admin-auth.ts and
// /api/admin/login) into the linked `User` row. Returns null if there's
// no cookie, it's invalid/expired, or the underlying account was
// deactivated/deleted since the cookie was issued.
//
// This is the fallback path used below whenever there's no Clerk
// session, so admins created via the "Admin Users" panel can use the
// rest of the admin panel exactly like a Clerk-authenticated admin.
// ─────────────────────────────────────────────
export async function getAdminAccountSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyAdminSessionToken(token);
  if (!payload) return null;

  const account = await prisma.adminAccount.findUnique({
    where: { id: payload.adminAccountId },
  });
  if (!account || !account.isActive) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== 'ADMIN') return null;

  return user;
}

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

  if (!clerkId) {
    // No Clerk session — check for a super-admin-issued admin account session
    const sessionUser = await getAdminAccountSessionUser();
    return sessionUser?.role === 'ADMIN';
  }

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

  if (!clerkId) {
    // No Clerk session — fall back to a super-admin-issued admin account
    // session (created via the "Admin Users" panel, logged in at
    // /admin/login). middleware.ts already keeps non-admin-session traffic
    // off /admin/*, so reaching here with neither means the cookie is
    // missing/expired.
    const sessionUser = await getAdminAccountSessionUser();
    if (!sessionUser) redirect('/admin/login');
    return sessionUser;
  }

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

  if (!clerkId) {
    // No Clerk session — a super-admin-created admin account (see
    // /admin/login) still counts as a valid user here, e.g. for the
    // admin side of chat/messaging.
    return getAdminAccountSessionUser();
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  return user ?? null;
}
// ─────────────────────────────────────────────
// requireSuperAdminApi
// Use in: /api/admin/admins routes (create/edit/delete admin accounts)
//
// Deliberately Clerk-only — does NOT fall back to the admin-session
// cookie. Admin accounts created through this feature can manage the
// rest of the panel like any admin, but only the two hardcoded
// SUPER_ADMIN_CLERK_IDS may create, edit, or delete other admins.
// ─────────────────────────────────────────────
export async function requireSuperAdminApi(): Promise<
  { clerkId: string; error: null } |
  { clerkId: null; error: NextResponse }
> {
  const { NextResponse } = await import("next/server");
  const { userId: clerkId } = await auth();

  if (!clerkId || !SUPER_ADMIN_CLERK_IDS.includes(clerkId)) {
    return { clerkId: null, error: NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 }) };
  }

  return { clerkId, error: null };
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
    // No Clerk session — fall back to a super-admin-issued admin account
    // session (see getAdminAccountSessionUser above).
    const sessionUser = await getAdminAccountSessionUser();
    if (!sessionUser) {
      return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user: sessionUser, error: null };
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


// ─────────────────────────────────────────────
// Per-module admin permissions (see src/lib/permissions.ts)
//
// getAdminAccess() resolves "who is this admin and what may they do":
//   • the hardcoded super admins        → edit everywhere, isSuperAdmin
//   • a super-admin-created AdminAccount → whatever the super admin set
//     (deactivated accounts get nothing)
//   • a legacy Clerk admin (role ADMIN, no AdminAccount row) → edit
//     everywhere, exactly as before this feature existed
// ─────────────────────────────────────────────
export interface AdminAccess {
  user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;
  isSuperAdmin: boolean;
  permissions: AdminPermissionMap;
}

export async function getAdminAccess(): Promise<AdminAccess | null> {
  const { userId: clerkId } = await auth();

  let user: AdminAccess['user'] | null = null;
  if (clerkId) {
    user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return null;
    if (SUPER_ADMIN_CLERK_IDS.includes(clerkId)) {
      return { user, isSuperAdmin: true, permissions: fullPermissions() };
    }
  } else {
    user = await getAdminAccountSessionUser();
  }

  if (!user || user.role !== 'ADMIN') return null;

  const account = await prisma.adminAccount.findUnique({ where: { linkedUserId: user.id } });
  if (account) {
    if (!account.isActive) return null;
    return { user, isSuperAdmin: false, permissions: normalizePermissions(account.permissions) };
  }

  // Legacy Clerk admin with no AdminAccount row — unchanged behaviour.
  return { user, isSuperAdmin: false, permissions: fullPermissions() };
}

/**
 * API-route guard. `requireModuleApi('savings', 'edit')` on every
 * POST/PATCH/DELETE; `'view'` (the default) on reads.
 */
export async function requireModuleApi(
  module: PermissionModule,
  level: PermissionLevel = 'view'
): Promise<
  { access: AdminAccess; error: null } |
  { access: null; error: NextResponse }
> {
  const { NextResponse } = await import('next/server');
  const access = await getAdminAccess();
  if (!access) {
    return { access: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!access.isSuperAdmin && !canAccess(access.permissions, module, level)) {
    return {
      access: null,
      error: NextResponse.json(
        {
          error:
            level === 'edit'
              ? 'You have view-only access to this section.'
              : 'You do not have access to this section.',
        },
        { status: 403 }
      ),
    };
  }
  return { access, error: null };
}

/** Server-action guard — throws instead of returning a response. */
export async function assertModuleAccess(
  module: PermissionModule,
  level: PermissionLevel = 'edit'
): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) throw new Error('Unauthorized');
  if (!access.isSuperAdmin && !canAccess(access.permissions, module, level)) {
    throw new Error(
      level === 'edit'
        ? 'You have view-only access to this section.'
        : 'You do not have access to this section.'
    );
  }
  return access;
}

/** Page/layout guard — sends admins without access back to the dashboard. */
export async function requireModulePage(
  module: PermissionModule,
  level: PermissionLevel = 'view'
): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) redirect('/admin/login');
  if (!access.isSuperAdmin && !canAccess(access.permissions, module, level)) {
    redirect('/admin/dashboard?denied=1');
  }
  return access;
}

/** Page guard for super-admin-only screens (admin management). */
export async function requireSuperAdminPage(): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) redirect('/admin/login');
  if (!access.isSuperAdmin) redirect('/admin/dashboard?denied=1');
  return access;
}

/** Like requireModuleApi, but passes if the admin has the level on ANY of the listed modules (for endpoints shared by several pages). */
export async function requireAnyModuleApi(
  modules: PermissionModule[],
  level: PermissionLevel = 'view'
): Promise<
  { access: AdminAccess; error: null } |
  { access: null; error: NextResponse }
> {
  const { NextResponse } = await import('next/server');
  const access = await getAdminAccess();
  if (!access) {
    return { access: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!access.isSuperAdmin && !modules.some((m) => canAccess(access.permissions, m, level))) {
    return { access: null, error: NextResponse.json({ error: 'You do not have access to this section.' }, { status: 403 }) };
  }
  return { access, error: null };
}
