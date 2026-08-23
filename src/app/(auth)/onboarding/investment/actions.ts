'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notifyAllAdmins } from '@/lib/notifications';

const OnboardingDataSchema = z.object({
  // Account type — Individual or Team. Team applicants additionally supply
  // a team name; they become the team owner once onboarding completes.
  accountType: z.enum(["INDIVIDUAL", "TEAM"]),
  teamName: z.string().optional(),

  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  sourceOfFunds: z.string().optional(),

  initialInvestment: z.number().min(1000),

  dateOfBirth: z.string().optional(),
  placeOfBirthCounty: z.string().optional(),
  placeOfBirthSubCounty: z.string().optional(),
  placeOfBirthWard: z.string().optional(),
  countyOfBirth: z.string().optional(),
  countyOfResidence: z.string().optional(),
  residentialAddress: z.string().optional(),

  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"]).optional(),
  professionalBackground: z.string().optional(),
  currentOccupation: z.string().optional(),

  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),

  // Document URLs (uploaded to Cloudflare R2) — required for KYC completion.
  selfieUrl: z.string().min(1, "Selfie photo is required."),
  idCopyUrl: z.string().min(1, "National ID copy is required."),
  // No longer collected during onboarding — clients email the signed,
  // original Investment Application Form to invest@ludevaplc.co.ke instead.
  investmentFormUrl: z.string().optional(),

  // Lock-in period for the initial investment, in years.
  lockInYears: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal(7), z.literal(10),
  ]),
}).refine(
  (d) => d.accountType !== "TEAM" || (d.teamName && d.teamName.trim().length >= 2),
  { message: "Team name is required for a Team account.", path: ["teamName"] }
);

export async function completeOnboarding(
  data: z.infer<typeof OnboardingDataSchema>
) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('You must be signed in.');

  const parsedData = OnboardingDataSchema.safeParse(data);
  if (!parsedData.success) throw new Error('Invalid data provided: ' + JSON.stringify(parsedData.error.flatten()));

  const d = parsedData.data;

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  const isFirstTimeCompletion = !user?.onboardingCompleted;

  const userData: any = {
    clerkId: clerkUser.id,
    email: d.email,
    fullName: d.fullName,
    sourceOfFunds: d.sourceOfFunds,
    accountType: d.accountType,
    teamName: d.teamName,
    initialInvestment: Math.round(d.initialInvestment),
    onboardingCompleted: true,
    kycSubmittedAt: new Date(),

    dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : undefined,
    placeOfBirthCounty: d.placeOfBirthCounty,
    placeOfBirthSubCounty: d.placeOfBirthSubCounty,
    placeOfBirthWard: d.placeOfBirthWard,
    countyOfBirth: d.placeOfBirthCounty || d.countyOfBirth,
    countyOfResidence: d.countyOfResidence,
    residentialAddress: d.residentialAddress,
    phone: d.phone,

    employmentStatus: d.employmentStatus,
    professionalBackground: d.professionalBackground,
    currentOccupation: d.currentOccupation,

    ludevaNumber: d.ludevaNumber,
    maritalStatus: d.maritalStatus,
    numberOfKids: d.numberOfKids,

    selfieUrl: d.selfieUrl,
    idCopyUrl: d.idCopyUrl,
    investmentFormUrl: d.investmentFormUrl,
    lockInYears: d.lockInYears,

    role: 'MEMBER' as const,
  };

  if (user) {
    user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: userData,
    });
  } else {
    user = await prisma.user.create({ data: userData });
  }

  // ✅ Team account: create the Team row (owner = this user) the first time
  // they complete onboarding as TEAM. Idempotent — re-submitting doesn't
  // create a second team, and someone already on/owning a team can't
  // spin up another one here.
  if (d.accountType === 'TEAM') {
    const [ownsTeam, isTeamMember] = await Promise.all([
      prisma.team.findUnique({ where: { ownerId: user.id } }),
      prisma.teamMembership.findUnique({ where: { userId: user.id } }),
    ]);

    if (!ownsTeam && !isTeamMember) {
      await prisma.team.create({
        data: { name: d.teamName!.trim(), ownerId: user.id },
      });
    } else if (ownsTeam && d.teamName && ownsTeam.name !== d.teamName.trim()) {
      await prisma.team.update({
        where: { id: ownsTeam.id },
        data: { name: d.teamName.trim() },
      });
    }
  }

  if (isFirstTimeCompletion) {
    await notifyAllAdmins(
      '🆕 New Investor Onboarded',
      `${d.fullName} (${d.email}) has completed onboarding with an initial investment of KES ${Math.round(d.initialInvestment).toLocaleString()}. KYC documents are ready for review.`,
      'KYC'
    );
  }

  const client = await clerkClient();
  const existingMetadata = clerkUser.publicMetadata || {};

  const nameParts = d.fullName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  await client.users.updateUser(clerkUser.id, {
    firstName,
    lastName,
    publicMetadata: {
      ...existingMetadata,
      onboardingCompleted: true,
      dbId: user.id,
      role: existingMetadata.role ?? user.role,
      accountType: d.accountType,
      teamName: d.teamName,
      dateOfBirth: d.dateOfBirth,
      placeOfBirthCounty: d.placeOfBirthCounty,
      placeOfBirthSubCounty: d.placeOfBirthSubCounty,
      placeOfBirthWard: d.placeOfBirthWard,
      sourceOfFunds: d.sourceOfFunds,
      employmentStatus: d.employmentStatus,
      currentOccupation: d.currentOccupation,
      lockInYears: d.lockInYears,
    },
  });

  revalidatePath('/member/dashboard');
  revalidatePath('/member/profile');
  revalidatePath('/onboarding/investment');

  return { success: true };
}
