import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

type ClerkUserExport = {
  id: string;
  email?: string;
  publicMetadata?: Record<string, any>;
};

type Args = {
  filePath: string;
  dryRun: boolean;
  createMissing: boolean;
  updateMetadata: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  return {
    filePath: argv.find((arg) => !arg.startsWith("--")) || "clerk-users.json",
    dryRun: argv.includes("--dry-run"),
    createMissing: argv.includes("--create-missing"),
    updateMetadata: argv.includes("--update-metadata"),
  };
}

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase();
}

async function loadExportedUsers(filePath: string): Promise<ClerkUserExport[]> {
  const raw = await readFile(path.resolve(process.cwd(), filePath), "utf-8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.users)) {
    return parsed.users;
  }

  if (Array.isArray(parsed.data)) {
    return parsed.data;
  }

  throw new Error(
    "Unsupported Clerk export format. Expected an array, { users: [...] }, or { data: [...] }."
  );
}

async function main() {
  const args = parseArgs();
  const exportedUsers = await loadExportedUsers(args.filePath);

  console.log("Clerk sync script starting...");
  console.log(`File: ${args.filePath}`);
  console.log(`Dry run: ${args.dryRun}`);
  console.log(`Create missing DB users: ${args.createMissing}`);
  console.log(`Update public metadata fields: ${args.updateMetadata}`);
  console.log(`Exported user rows: ${exportedUsers.length}\n`);

  let synced = 0;
  let skipped = 0;
  let missing = 0;
  let conflicts = 0;

  for (const exportedUser of exportedUsers) {
    const email = normalizeEmail(exportedUser.email);
    const clerkId = exportedUser.id;

    if (!email) {
      console.warn(`Skipping exported user missing email: ${clerkId}`);
      skipped++;
      continue;
    }

    const dbUser = await prisma.user.findUnique({ where: { email } });

    if (!dbUser) {
      missing++;
      console.warn(`No DB user found with email ${email}`);
      if (!args.createMissing) continue;

      if (args.dryRun) {
        console.log(`Would create DB user for ${email} with clerkId ${clerkId}`);
        continue;
      }

      await prisma.user.create({
        data: {
          clerkId,
          email,
          onboardingCompleted: false,
          role: "MEMBER",
          accountType: "INDIVIDUAL",
        },
      });
      synced++;
      continue;
    }

    if (dbUser.clerkId === clerkId) {
      if (args.updateMetadata && exportedUser.publicMetadata) {
        const metadata = exportedUser.publicMetadata;
        const updates: any = {};

        if (typeof metadata.onboardingCompleted === "boolean") {
          updates.onboardingCompleted = metadata.onboardingCompleted;
        }

        if (typeof metadata.kycStatus === "string") {
          updates.kycStatus = metadata.kycStatus;
        }

        if (typeof metadata.role === "string") {
          updates.role = metadata.role;
        }

        if (Object.keys(updates).length > 0) {
          if (args.dryRun) {
            console.log(`Would update metadata fields for ${email}:`, updates);
          } else {
            await prisma.user.update({ where: { id: dbUser.id }, data: updates });
            synced++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }

      continue;
    }

    const existingClerk = await prisma.user.findUnique({ where: { clerkId } });
    if (existingClerk && existingClerk.email !== email) {
      conflicts++;
      console.warn(
        `Conflict: exported clerkId ${clerkId} already exists on DB user ${existingClerk.email}. Skipping ${email}.`
      );
      continue;
    }

    if (args.dryRun) {
      console.log(`Would update DB user ${email} from clerkId ${dbUser.clerkId} to ${clerkId}`);
      synced++;
      continue;
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        clerkId,
        ...(args.updateMetadata && exportedUser.publicMetadata
          ? {
              onboardingCompleted:
                typeof exportedUser.publicMetadata.onboardingCompleted === "boolean"
                  ? exportedUser.publicMetadata.onboardingCompleted
                  : dbUser.onboardingCompleted,
              kycStatus:
                typeof exportedUser.publicMetadata.kycStatus === "string"
                  ? exportedUser.publicMetadata.kycStatus
                  : dbUser.kycStatus,
              role:
                typeof exportedUser.publicMetadata.role === "string"
                  ? exportedUser.publicMetadata.role
                  : dbUser.role,
            }
          : {}),
      },
    });

    console.log(`Updated ${email}: clerkId ${dbUser.clerkId} -> ${clerkId}`);
    synced++;
  }

  console.log("\n--- Summary ---");
  console.log(`Updated or would update: ${synced}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Missing DB users: ${missing}`);
  console.log(`Clerk ID conflicts: ${conflicts}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
