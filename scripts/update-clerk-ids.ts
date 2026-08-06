import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

async function main() {
  console.log("====================================");
  console.log("Updating MongoDB Clerk IDs");
  console.log("====================================\n");

  let updated = 0;
  let noMongoMatch = 0;
  let alreadyCorrect = 0;
  let errors = 0;

  const unmatched: string[] = [];

  let offset = 0;
  const limit = 100;

  while (true) {
    const result = await clerk.users.getUserList({
      limit,
      offset,
    });

    const users = result.data;

    if (users.length === 0) break;

    console.log(
      `Processing users ${offset + 1} - ${offset + users.length}...`
    );

    for (const clerkUser of users) {
      try {
        const email =
          clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          )?.emailAddress ??
          clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
          console.log(`⚠ User ${clerkUser.id} has no email.`);
          continue;
        }

        const dbUser = await prisma.user.findUnique({
          where: {
            email: email.toLowerCase(),
          },
        });

        if (!dbUser) {
          noMongoMatch++;
          unmatched.push(email);
          console.log(`⚠ No MongoDB user for ${email}`);
          continue;
        }

        if (dbUser.clerkId === clerkUser.id) {
          alreadyCorrect++;
          continue;
        }

        await prisma.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            clerkId: clerkUser.id,
          },
        });

        updated++;

        console.log(
          `✓ ${email}\n   ${dbUser.clerkId} -> ${clerkUser.id}`
        );
      } catch (err) {
        errors++;
        console.error(err);
      }
    }

    offset += users.length;
  }

  console.log("\n====================================");
  console.log("Migration Complete");
  console.log("====================================");
  console.log(`✅ Updated: ${updated}`);
  console.log(`✅ Already Correct: ${alreadyCorrect}`);
  console.log(`⚠ No MongoDB Match: ${noMongoMatch}`);
  console.log(`❌ Errors: ${errors}`);

  if (unmatched.length) {
    console.log("\nUsers missing from MongoDB:");
    unmatched.forEach((u) => console.log(` - ${u}`));
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});