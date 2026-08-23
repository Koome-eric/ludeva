import { auth } from '@clerk/nextjs/server';
import { getCurrentUserFromDB } from '@/lib/user';
import { assertKycApproved } from '@/lib/auth-guard';
import { getTeamContext } from '@/lib/team';
import { TeamPanelClient } from '@/components/TeamPanelClient';
import { TeamSignupLanding } from '@/components/TeamSignupLanding';

export default async function TeamPage() {
  const { userId: clerkId } = await auth();

  // Not signed in at all — show the "sign up as a team" landing instead of
  // bouncing straight to /sign-in, so a shared link to this page works for
  // people who don't have an account yet.
  if (!clerkId) {
    return (
      <div className="max-w-5xl mx-auto">
        <TeamSignupLanding />
      </div>
    );
  }

  const user = await getCurrentUserFromDB();

  // Signed in with Clerk, but hasn't finished (or started) onboarding yet —
  // same landing, with a lighter nudge toward finishing onboarding instead
  // of creating a fresh account.
  if (!user || !user.onboardingCompleted) {
    return (
      <div className="max-w-5xl mx-auto">
        <TeamSignupLanding hasAccount />
      </div>
    );
  }

  assertKycApproved(user);

  const ctx = await getTeamContext(user);

  // Serialize to plain objects for the client component.
  const teamData = ctx
    ? {
        id: ctx.team.id,
        name: ctx.team.name,
        isOwner: ctx.isOwner,
        membershipId: ctx.membershipId,
        permissions: ctx.permissions,
        owner: {
          id: ctx.team.owner.id,
          fullName: ctx.team.owner.fullName,
          email: ctx.team.owner.email,
        },
        members: ctx.team.members.map((m) => ({
          membershipId: m.id,
          userId: m.userId,
          fullName: m.user.fullName,
          email: m.user.email,
          canInvite: m.canInvite,
          canManagePermissions: m.canManagePermissions,
          canRemoveMembers: m.canRemoveMembers,
          canInvestPooled: m.canInvestPooled,
          canViewPooledFunds: m.canViewPooledFunds,
          canViewAllReports: m.canViewAllReports,
          canWithdraw: m.canWithdraw,
          canManageAnalytics: m.canManageAnalytics,
        })),
        invites: ctx.team.invites.map((i) => ({
          id: i.id,
          email: i.email,
          status: i.status,
          expiresAt: i.expiresAt.toISOString(),
          createdAt: i.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-semibold">
          L <span className="text-primary">Chama</span>
        </h1>
        <p className="text-muted-foreground">
          Invest together with your chama — invite members, assign roles, and share one dashboard.
        </p>
      </div>

      <TeamPanelClient team={teamData} currentUserId={user.id} />
    </div>
  );
}
