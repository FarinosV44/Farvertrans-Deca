import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { setAlertStatus } from "@/lib/commercial/alerts";

export const runtime = "nodejs";

const schema = z.object({ status: z.enum(["reviewed", "dismissed", "pending"]) });

/** Mark a commercial alert reviewed / dismissed (#90). 404 for a non-internal caller. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
  }
  const ok = await setAlertStatus(id, parsed.data.status, admin.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
