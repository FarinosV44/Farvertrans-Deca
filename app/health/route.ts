import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

/**
 * Liveness endpoint. Reports the app version and whether the DB is reachable.
 * Never leaks connection details.
 */
export async function GET() {
  let db: "up" | "down" | "unconfigured" = "unconfigured";

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRaw`SELECT 1`;
      db = "up";
    } catch {
      db = "down";
    }
  }

  const healthy = db !== "down";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", version: APP_VERSION, db },
    { status: healthy ? 200 : 503 },
  );
}
