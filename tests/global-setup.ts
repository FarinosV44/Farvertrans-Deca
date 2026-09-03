import { PrismaClient } from "../prisma/generated/client/index.js";

/**
 * Clears the rate-limit counters before an e2e run so repeated local runs from
 * the same machine IP don't accumulate into a throttle. Never touches product data.
 */
export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    await prisma.abuseCounter.deleteMany({});
    await prisma.event.deleteMany({});
  } finally {
    await prisma.$disconnect();
  }
}
