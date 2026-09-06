/**
 * Synthetic seed data for the local playground (NEVER real data).
 * Run: npm run seed   (requires npm run db:up + npm run db:migrate first)
 */
import { scryptSync, randomBytes } from "node:crypto";
import { PrismaClient } from "./generated/client";
import { seedContent } from "./content-seed";
import { ADMIN_TEST_TOTP_SECRET } from "../tests/fixtures/admin-totp-secret";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  const operators = [
    { name: "Adrián", refCode: "adrian" },
    { name: "María", refCode: "maria" },
    { name: "Diana", refCode: "diana" },
    { name: "Alejandro", refCode: "alejandro" },
  ];

  for (const op of operators) {
    await prisma.operator.upsert({
      where: { refCode: op.refCode },
      update: { name: op.name, active: true },
      create: { ...op, active: true },
    });
  }

  // Internal-role user for the operator dashboard (local dev / tests only).
  // TOTP is pre-enrolled with a fixed, publicly-known-to-be-a-test secret
  // (SECURITY #53 mandatory admin 2FA) so e2e can exercise the real
  // login → TOTP challenge → /admin flow instead of bypassing it — the e2e
  // helpers compute a live code from this same constant at auth time.
  const adminEmail = "admin@farvertrans.local";
  const existing = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        authUserId: "local:seed-admin",
        email: adminEmail,
        passwordHash: hashPassword("admin-dev-only"),
        role: "internal",
        totpSecret: ADMIN_TEST_TOTP_SECRET,
        totpEnabledAt: new Date(),
      },
    });
  } else if (!existing.totpEnabledAt) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { totpSecret: ADMIN_TEST_TOTP_SECRET, totpEnabledAt: new Date() },
    });
  }

  const contentCount = await seedContent(prisma);

  console.log(
    `Seeded ${operators.length} operators + 1 internal user (${adminEmail} / admin-dev-only) + ${contentCount} content item(s).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
