'use server';

import crypto from 'crypto';
import { Resend } from 'resend';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notifyUser } from '@/lib/notifications';
import {
  getTeamContext,
  hasPermission,
  DEFAULT_INVITE_PERMISSIONS,
  type TeamPermissions,
} from '@/lib/team';

const resend = new Resend(process.env.RESEND_API_KEY);
const INVITE_EXPIRY_DAYS = 7;

async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('You must be signed in.');
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error('Complete your profile before using the Team Panel.');
  return user;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://ludevaplc.co.ke';
}

// ─────────────────────────────────────────────
// Create a team (opts an existing member into a TEAM account as owner)
// ─────────────────────────────────────────────
export async function createTeam(teamName: string) {
  const user = await getCurrentDbUser();
  const name = teamName?.trim();
  if (!name || name.length < 2) throw new Error('Team name must be at least 2 characters.');

  const [ownsTeam, isMember] = await Promise.all([
    prisma.team.findUnique({ where: { ownerId: user.id } }),
    prisma.teamMembership.findUnique({ where: { userId: user.id } }),
  ]);

  if (ownsTeam) throw new Error('You already own a team.');
  if (isMember) throw new Error('You are already part of a team — leave it first to create a new one.');

  const team = await prisma.team.create({ data: { name, ownerId: user.id } });

  await prisma.user.update({
    where: { id: user.id },
    data: { accountType: 'TEAM', teamName: name },
  });

  revalidatePath('/member/team');
  revalidatePath('/member/dashboard');
  return { success: true, teamId: team.id };
}

// ─────────────────────────────────────────────
// Invite a member by email with a specific permission set
// ─────────────────────────────────────────────
export async function inviteTeamMember(input: {
  email: string;
  permissions?: Partial<TeamPermissions>;
}) {
  const user = await getCurrentDbUser();
  const ctx = await getTeamContext(user);
  if (!ctx) throw new Error('You are not part of a team yet.');
  if (!hasPermission(ctx, 'canInvite')) {
    throw new Error("You don't have permission to invite members.");
  }

  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
  if (email === user.email.toLowerCase()) throw new Error("You can't invite yourself.");

  const alreadyMember =
    ctx.team.owner.email.toLowerCase() === email ||
    ctx.team.members.some((m) => m.user.email.toLowerCase() === email);
  if (alreadyMember) throw new Error('This person is already on the team.');

  const existingInvite = await prisma.teamInvite.findFirst({
    where: { teamId: ctx.team.id, email, status: 'PENDING' },
  });
  if (existingInvite) throw new Error('An invite is already pending for this email.');

  const token = crypto.randomBytes(24).toString('hex');
  const perms: TeamPermissions = { ...DEFAULT_INVITE_PERMISSIONS, ...input.permissions };

  await prisma.teamInvite.create({
    data: {
      teamId: ctx.team.id,
      email,
      token,
      invitedById: user.id,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      ...perms,
    },
  });

  const acceptUrl = `${appUrl()}/team/invite/${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: 'Ludeva <noreply@ludevaplc.co.ke>',
        to: [email],
        subject: `You're invited to join ${ctx.team.name} on Ludeva`,
        html: `
          <h2>You've been invited to join ${ctx.team.name}</h2>
          <p>${user.fullName || user.email} has invited you to join their team account on Ludeva. Once you accept, you'll get access to the shared team dashboard and services.</p>
          <p><a href="${acceptUrl}" style="display:inline-block;padding:10px 20px;background:#0f6b3a;color:#fff;border-radius:6px;text-decoration:none;">Accept Invite</a></p>
          <p>Or copy this link: ${acceptUrl}</p>
          <p style="color:#888;font-size:12px;">This invite expires in ${INVITE_EXPIRY_DAYS} days. If you weren't expecting this, you can ignore this email.</p>
        `,
      });
    } catch (err) {
      console.error('❌ Failed to send team invite email:', err);
      // Invite row still exists — the owner can share acceptUrl manually.
    }
  }

  revalidatePath('/member/team');
  return { success: true, acceptUrl };
}

// ─────────────────────────────────────────────
// Revoke a pending invite
// ─────────────────────────────────────────────
export async function revokeInvite(inviteId: string) {
  const user = await getCurrentDbUser();
  const ctx = await getTeamContext(user);
  if (!ctx) throw new Error('You are not part of a team.');
  if (!hasPermission(ctx, 'canInvite')) {
    throw new Error("You don't have permission to manage invites.");
  }

  const invite = ctx.team.invites.find((i) => i.id === inviteId);
  if (!invite) throw new Error('Invite not found.');

  await prisma.teamInvite.update({ where: { id: inviteId }, data: { status: 'REVOKED' } });
  revalidatePath('/member/team');
  return { success: true };
}

// ─────────────────────────────────────────────
// Update a member's permissions
// ─────────────────────────────────────────────
export async function updateMemberPermissions(
  membershipId: string,
  permissions: Partial<TeamPermissions>
) {
  const user = await getCurrentDbUser();
  const ctx = await getTeamContext(user);
  if (!ctx) throw new Error('You are not part of a team.');
  if (!hasPermission(ctx, 'canManagePermissions')) {
    throw new Error("You don't have permission to manage member permissions.");
  }

  const target = ctx.team.members.find((m) => m.id === membershipId);
  if (!target) throw new Error('Member not found.');

  await prisma.teamMembership.update({
    where: { id: membershipId },
    data: permissions,
  });

  revalidatePath('/member/team');
  return { success: true };
}

// ─────────────────────────────────────────────
// Remove a member from the team
// ─────────────────────────────────────────────
export async function removeMember(membershipId: string) {
  const user = await getCurrentDbUser();
  const ctx = await getTeamContext(user);
  if (!ctx) throw new Error('You are not part of a team.');
  if (!hasPermission(ctx, 'canRemoveMembers')) {
    throw new Error("You don't have permission to remove members.");
  }

  const target = ctx.team.members.find((m) => m.id === membershipId);
  if (!target) throw new Error('Member not found.');

  await prisma.$transaction([
    prisma.teamMembership.delete({ where: { id: membershipId } }),
    prisma.user.update({
      where: { id: target.userId },
      data: { accountType: 'INDIVIDUAL', teamName: null },
    }),
  ]);

  await notifyUser(
    target.userId,
    'Removed from team',
    `You have been removed from ${ctx.team.name}. Your account is now individual.`,
    'SYSTEM'
  );

  revalidatePath('/member/team');
  return { success: true };
}

// ─────────────────────────────────────────────
// Leave a team (member-initiated)
// ─────────────────────────────────────────────
export async function leaveTeam() {
  const user = await getCurrentDbUser();
  const membership = await prisma.teamMembership.findUnique({ where: { userId: user.id } });
  if (!membership) throw new Error('You are not part of a team.');

  await prisma.$transaction([
    prisma.teamMembership.delete({ where: { id: membership.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: { accountType: 'INDIVIDUAL', teamName: null },
    }),
  ]);

  revalidatePath('/member/team');
  revalidatePath('/member/dashboard');
  return { success: true };
}

// ─────────────────────────────────────────────
// Accept an invite (called from the /team/invite/[token] page once signed in)
// ─────────────────────────────────────────────
export async function acceptTeamInvite(token: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('You must be signed in to accept this invite.');

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: true },
  });
  if (!invite) throw new Error('This invite link is invalid.');

  if (invite.status === 'ACCEPTED') throw new Error('This invite has already been accepted.');
  if (invite.status === 'REVOKED') throw new Error('This invite has been revoked by the team owner.');
  if (invite.status === 'EXPIRED' || invite.expiresAt < new Date()) {
    if (invite.status !== 'EXPIRED') {
      await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
    }
    throw new Error('This invite has expired. Ask the team owner to send a new one.');
  }

  const clerkEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!clerkEmail || clerkEmail.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error(
      `This invite was sent to ${invite.email}. Please sign in with that email address to accept it.`
    );
  }

  let user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkEmail,
        fullName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || undefined,
        accountType: 'TEAM',
        teamName: invite.team.name,
        // Joining an already-vetted team grants immediate dashboard access,
        // per the team owner's onboarding rather than a fresh individual KYC.
        onboardingCompleted: true,
        kycStatus: 'APPROVED',
        kycSubmittedAt: new Date(),
        role: 'MEMBER',
      },
    });
  } else {
    const alreadyOwnsOrBelongs = await prisma.teamMembership.findUnique({ where: { userId: user.id } });
    if (alreadyOwnsOrBelongs) throw new Error('You are already part of a team.');
    const ownsAnother = await prisma.team.findUnique({ where: { ownerId: user.id } });
    if (ownsAnother) throw new Error('You already own your own team.');

    user = await prisma.user.update({
      where: { id: user.id },
      data: { accountType: 'TEAM', teamName: invite.team.name },
    });
  }

  await prisma.teamMembership.create({
    data: {
      teamId: invite.teamId,
      userId: user.id,
      canInvite: invite.canInvite,
      canManagePermissions: invite.canManagePermissions,
      canRemoveMembers: invite.canRemoveMembers,
      canInvestPooled: invite.canInvestPooled,
      canViewPooledFunds: invite.canViewPooledFunds,
      canViewAllReports: invite.canViewAllReports,
      canWithdraw: invite.canWithdraw,
      canManageAnalytics: invite.canManageAnalytics,
    },
  });

  await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });

  const client = await clerkClient();
  const existingMetadata = clerkUser.publicMetadata || {};
  await client.users.updateUser(clerkUser.id, {
    publicMetadata: {
      ...existingMetadata,
      onboardingCompleted: true,
      dbId: user.id,
      role: existingMetadata.role ?? user.role,
      accountType: 'TEAM',
      teamName: invite.team.name,
    },
  });

  await notifyUser(
    invite.invitedById,
    'Invite accepted',
    `${user.fullName || user.email} has joined ${invite.team.name}.`,
    'SYSTEM'
  );

  revalidatePath('/member/dashboard');
  revalidatePath('/member/team');
  return { success: true };
}
