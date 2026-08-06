import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error("Usage: npx tsx scripts/inspect-user.ts <email|clerkId>");
    process.exit(1);
  }

  const where = identifier.startsWith("user_")
    ? { clerkId: identifier }
    : { email: identifier.toLowerCase() };

  const user = await prisma.user.findUnique({
    where,
    select: {
      id: true,
      clerkId: true,
      email: true,
      fullName: true,
      role: true,
      accountType: true,
      teamName: true,
      onboardingCompleted: true,
      kycStatus: true,
      kycSubmittedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    console.log(`No user found for ${JSON.stringify(identifier)}`);
    process.exit(0);
  }

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
