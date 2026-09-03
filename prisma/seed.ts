/**
 * Synthetic seed data for the local playground (NEVER real data).
 * Run: npm run seed   (requires npm run db:up + npm run db:migrate first)
 */
import { scryptSync, randomBytes } from "node:crypto";
import { PrismaClient } from "./generated/client";

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
  const adminEmail = "admin@farvertrans.local";
  const existing = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        authUserId: "local:seed-admin",
        email: adminEmail,
        passwordHash: hashPassword("admin-dev-only"),
        role: "internal",
      },
    });
  }

  console.log(
    `Seeded ${operators.length} operators + 1 internal user (${adminEmail} / admin-dev-only).`,
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
