'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const OnboardingDataSchema = z.object({
  accountType: z.enum(["INDIVIDUAL", "TEAM"]),
  teamName: z.string().optional(),

  fullName: z.string().min(2),
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

  // Document URLs (uploaded via Cloudinary) — required for KYC completion.
  selfieUrl: z.string().min(1, "Selfie photo is required."),
  idCopyUrl: z.string().min(1, "National ID copy is required."),
}).superRefine((data, ctx) => {
  if (data.accountType === "TEAM" && (!data.teamName || data.teamName.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Team name is required for a team account.",
      path: ["teamName"],
    });
  }
});

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

    employmentStatus: d.employmentStatus,
    professionalBackground: d.professionalBackground,
    currentOccupation: d.currentOccupation,

    ludevaNumber: d.ludevaNumber,
    maritalStatus: d.maritalStatus,
    numberOfKids: d.numberOfKids,

    selfieUrl: d.selfieUrl,
    idCopyUrl: d.idCopyUrl,

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
    },
  });

  revalidatePath('/member/dashboard');
  revalidatePath('/member/profile');
  revalidatePath('/onboarding/investment');

  return { success: true };
}
