import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { adminTicketUpdateSchema } from "@/lib/support/schema";
import { updateSupportTicket } from "@/lib/support/tickets";

export const runtime = "nodejs";

/**
 * Superadmin reply and/or status change on a technical-support ticket
 * (#86 part 5). 404 (never 403) for a non-internal caller — the area is
 * undiscoverable.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const { id } = await params;
  const parsed = adminTicketUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
  }

  const r = await updateSupportTicket(id, admin.id, parsed.data);
  if (!r) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ ok: true, status: r.status });
}
