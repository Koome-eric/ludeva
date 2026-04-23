'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ✅ UPDATED SCHEMA
const OnboardingDataSchema = z.object({
  accountType: z.enum(["INDIVIDUAL", "TEAM"]),

  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  nationalId: z.string().min(5),

  initialInvestment: z.number().min(1000),

  dateOfBirth: z.string().optional(),
  countyOfBirth: z.string().optional(),
  countyOfResidence: z.string().optional(),

  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),

  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
});

export async function completeOnboarding(
  data: z.infer<typeof OnboardingDataSchema>
) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('You must be signed in.');

  const parsedData = OnboardingDataSchema.safeParse(data);
  if (!parsedData.success) throw new Error('Invalid data provided.');

  const {
    accountType,
    fullName,
    email,
    phone,
    nationalId,
    initialInvestment,
    dateOfBirth,
    countyOfBirth,
    countyOfResidence,
    ludevaNumber,
    maritalStatus,
    numberOfKids,
    nextOfKinName,
    nextOfKinPhone,
    nextOfKinEmail,
  } = parsedData.data;

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  const userData = {
    clerkId: clerkUser.id,
    email,
    fullName,
    phone,
    nationalId,

    accountType, // ✅ SAVE

    initialInvestment: Math.round(initialInvestment),
    onboardingCompleted: true,

    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    countyOfBirth,
    countyOfResidence,

    ludevaNumber,
    maritalStatus,
    numberOfKids,

    nextOfKinName,
    nextOfKinPhone,
    nextOfKinEmail,

    role: 'MEMBER' as const,
  };

  if (user) {
    user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: userData,
    });
  } else {
    user = await prisma.user.create({
      data: userData,
    });
  }

  const client = await clerkClient();
  const existingMetadata = clerkUser.publicMetadata || {};

  const nameParts = fullName.trim().split(' ');
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

      accountType, // ✅ SAVE IN CLERK

      dateOfBirth,
      countyOfBirth,
      countyOfResidence,
      ludevaNumber,
      maritalStatus,
      numberOfKids,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinEmail,
    },
  });

  revalidatePath('/member/dashboard');
  revalidatePath('/member/profile');
  revalidatePath('/onboarding/investment');

  return { success: true };
}