import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { saveAlertConfig } from "@/lib/commercial/alerts";

export const runtime = "nodejs";

const schema = z.object({
  priorityCorridors: z.array(z.string().trim().max(40)).max(20).optional(),
  priorityCountries: z.array(z.string().trim().max(40)).max(20).optional(),
  minMovements: z.number().int().min(0).max(100).optional(),
  windowDays: z.number().int().min(1).max(365).optional(),
  staleFollowUpDays: z.number().int().min(1).max(365).optional(),
  reactivationDays: z.number().int().min(1).max(365).optional(),
});

/** Save the commercial-alert rule config (#90). 404 for a non-internal caller. */
export async function POST(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
  }
  await saveAlertConfig(parsed.data, admin.id);
  return NextResponse.json({ ok: true });
}
