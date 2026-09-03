/**
 * Synthetic seed data for the local playground (NEVER real data).
 * Run: npm run seed   (requires npm run db:up + npm run db:migrate first)
 */
import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

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

  console.log(`Seeded ${operators.length} operators.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
