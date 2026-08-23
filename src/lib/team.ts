import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

// ─────────────────────────────────────────────
// Team Panel — shared types & permission helpers
// ─────────────────────────────────────────────

export type TeamPermissions = {
  canInvite: boolean;            // generate/send new invite links
  canManagePermissions: boolean; // edit other members' permissions
  canRemoveMembers: boolean;     // remove members from the team
  canInvestPooled: boolean;      // contribute to the shared team investment
  canViewPooledFunds: boolean;   // view the shared/pooled investment balance
  canViewAllReports: boolean;    // view every member's personal reports
  canWithdraw: boolean;          // request withdrawals from pooled funds
  canManageAnalytics: boolean;   // upload/manage team analytics documents
};

// The owner always has full access — these are the flags checks fall back to.
export const OWNER_PERMISSIONS: TeamPermissions = {
  canInvite: true,
  canManagePermissions: true,
  canRemoveMembers: true,
  canInvestPooled: true,
  canViewPooledFunds: true,
  canViewAllReports: true,
  canWithdraw: true,
  canManageAnalytics: true,
};

// Sensible defaults when the invite form doesn't override a flag.
export const DEFAULT_INVITE_PERMISSIONS: TeamPermissions = {
  canInvite: false,
  canManagePermissions: false,
  canRemoveMembers: false,
  canInvestPooled: true,
  canViewPooledFunds: true,
  canViewAllReports: false,
  canWithdraw: false,
  canManageAnalytics: false,
};

export const PERMISSION_LABELS: Record<keyof TeamPermissions, string> = {
  canInvite: 'Invite new members',
  canManagePermissions: "Manage other members' permissions",
  canRemoveMembers: 'Remove members from the team',
  canInvestPooled: 'Contribute to the pooled team investment',
  canViewPooledFunds: 'View the pooled investment balance',
  canViewAllReports: "View all members' reports",
  canWithdraw: 'Request withdrawals from pooled funds',
  canManageAnalytics: 'Manage team analytics documents',
};

export function permissionsFrom(source: Record<string, any>): TeamPermissions {
  return {
    canInvite: !!source.canInvite,
    canManagePermissions: !!source.canManagePermissions,
    canRemoveMembers: !!source.canRemoveMembers,
    canInvestPooled: !!source.canInvestPooled,
    canViewPooledFunds: !!source.canViewPooledFunds,
    canViewAllReports: !!source.canViewAllReports,
    canWithdraw: !!source.canWithdraw,
    canManageAnalytics: !!source.canManageAnalytics,
  };
}

export type TeamContext = {
  team: {
    id: string;
    name: string;
    ownerId: string;
    owner: User;
    members: Array<{ id: string; userId: string; user: User } & TeamPermissions>;
    invites: Array<{
      id: string;
      email: string;
      status: string;
      expiresAt: Date;
      createdAt: Date;
    } & TeamPermissions>;
  };
  isOwner: boolean;
  membershipId: string | null;
  permissions: TeamPermissions;
};

// Resolves the team a user belongs to, whether as owner or invited member,
// along with that user's effective permissions. Returns null if the user
// isn't part of any team.
export async function getTeamContext(user: User): Promise<TeamContext | null> {
  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: user.id },
    include: {
      owner: true,
      members: { include: { user: true } },
      invites: { where: { status: 'PENDING' } },
    },
  });

  if (ownedTeam) {
    return {
      team: ownedTeam as any,
      isOwner: true,
      membershipId: null,
      permissions: OWNER_PERMISSIONS,
    };
  }

  const membership = await prisma.teamMembership.findUnique({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          owner: true,
          members: { include: { user: true } },
          invites: { where: { status: 'PENDING' } },
        },
      },
    },
  });

  if (!membership) return null;

  return {
    team: membership.team as any,
    isOwner: false,
    membershipId: membership.id,
    permissions: permissionsFrom(membership),
  };
}

export function hasPermission(ctx: TeamContext, key: keyof TeamPermissions): boolean {
  return ctx.isOwner || !!ctx.permissions[key];
}
