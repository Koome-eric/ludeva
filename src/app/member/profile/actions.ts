'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getCurrentUserFromDB } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const ProfileDataSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(5),
  nationalId: z.string().min(5),
  dateOfBirth: z.string().optional(),
  countyOfBirth: z.string().optional(),
  countyOfResidence: z.string().optional(),
  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
})

export async function updateProfile(data: z.infer<typeof ProfileDataSchema>) {
  // 1️⃣ Get user from DB
  const user = await getCurrentUserFromDB()
  if (!user) throw new Error('You must be signed in to update your profile.')

  // 2️⃣ Validate data
  const parsed = ProfileDataSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid data provided.')

  const {
    fullName,
    phone,
    nationalId,
    dateOfBirth,
    countyOfBirth,
    countyOfResidence,
    ludevaNumber,
    maritalStatus,
    numberOfKids,
    nextOfKinName,
    nextOfKinPhone,
    nextOfKinEmail,
  } = parsed.data

  // 3️⃣ Update Prisma DB
  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName,
      phone,
      nationalId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      countyOfBirth,
      countyOfResidence,
      ludevaNumber,
      maritalStatus,
      numberOfKids,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinEmail,
    },
  })

  // 4️⃣ Update Clerk metadata if clerkId exists
  if (user.clerkId) {
    const [firstName, ...lastNameParts] = fullName.trim().split(' ')
    const lastName = lastNameParts.join(' ') || undefined

    try {
      // Use updateUser if available
      if (clerkClient.users?.updateUser) {
        await clerkClient.users.updateUser(user.clerkId, {
          firstName,
          lastName,
          publicMetadata: {
            phone,
            nationalId,
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
        })
      }
      // Fallback to updateUserMetadata if updateUser doesn't exist
      else if (clerkClient.users?.updateUserMetadata) {
        await clerkClient.users.updateUserMetadata(user.clerkId, {
          publicMetadata: {
            phone,
            nationalId,
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
        })
      } else {
        console.warn('Clerk updateUser method unavailable. Skipping Clerk update.')
      }
    } catch (err) {
      console.error('Failed to update Clerk user:', err)
      // Do not crash the server — Prisma is already updated
    }
  } else {
    console.warn('User does not have a Clerk ID. Skipping Clerk update.')
  }

  // 5️⃣ Revalidate the profile page
  revalidatePath('/member/profile')

  return { success: true }
}