import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Retrieves the currently authenticated user's record from your local database.
 * This function is essential for scoping data access in a multi-tenant application.
 * 
 * It uses the `clerkId` from the active Clerk session to find the corresponding
 * user in your `User` table.
 * 
 * @returns {Promise<User | null>} The user object from your database, or null if not found or not authenticated.
 */
export async function getCurrentUserFromDB() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId },
  });

  return user;
}
