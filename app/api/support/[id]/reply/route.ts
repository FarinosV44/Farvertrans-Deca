import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAbuse } from "@/lib/abuse";
import { abuseResponse } from "@/lib/abuse/response";
import { ticketReplySchema } from "@/lib/support/schema";
import { addUserReply, getUserTicket } from "@/lib/support/tickets";

export const runtime = "nodejs";

/** A user replies on their own technical-support ticket (#86 part 5). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) {
    return NextResponse.json({ error: { code: "auth_required" } }, { status: 401 });
  }
  if (user.companyRole === "read_only") {
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });
  }

  const decision = await checkAbuse("share", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
  });
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  const { id } = await params;
  const ticket = await getUserTicket(id, user.companyId);
  if (!ticket) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const parsed = ticketReplySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
  }

  const r = await addUserReply(id, user.id, parsed.data.body);
  if (!r) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
