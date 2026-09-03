import { NextResponse } from "next/server";
import { eventInputSchema } from "@/lib/analytics/events";

export const runtime = "nodejs";

/**
 * First-party analytics ingest (F14). Schema-validated, rate-tolerant, and it
 * NEVER 5xx: a malformed or failed beacon is dropped silently (204).
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = eventInputSchema.safeParse(json);
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const { name, sessionId, path, ref, appVersion } = parsed.data;
    const { prisma } = await import("@/lib/prisma");
    await prisma.event.create({
      data: {
        name,
        sessionId,
        path,
        refSnapshot: ref && Object.keys(ref).length ? ref : undefined,
        appVersion,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    // ingestion is best-effort; losing an event must never surface to the user
    return new NextResponse(null, { status: 204 });
  }
}
