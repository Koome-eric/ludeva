'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserFromDB } from '@/lib/user'
import { prisma } from '@/lib/prisma'

export async function updateProfile(values: {
  phone: string
  nationalId: string
  fullName: string
}) {
  const user = await getCurrentUserFromDB()
  if (!user) throw new Error('Unauthorized')

  const { phone, nationalId, fullName } = values

  // Update DB via Prisma
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone,
      nationalId,
      fullName,
    },
  })

  // ✅ CORRECT Clerk usage
  const clerk = await clerkClient()

  await clerk.users.updateUser(user.clerkId, {
    publicMetadata: {
      phone,
      nationalId,
      fullName,
    },
  })
}
