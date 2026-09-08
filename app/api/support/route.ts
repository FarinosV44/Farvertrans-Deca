import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAbuse } from "@/lib/abuse";
import { abuseResponse } from "@/lib/abuse/response";
import { createTicketSchema } from "@/lib/support/schema";
import { createSupportTicket } from "@/lib/support/tickets";

export const runtime = "nodejs";

/**
 * Open a technical-support ticket (#86 part 5). Authenticated members only —
 * the ticket must be attributable to a real account. Legal queries never come
 * here (#86 part 6).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) {
    return NextResponse.json({ error: { code: "auth_required" } }, { status: 401 });
  }
  if (user.companyRole === "read_only") {
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });
  }

  const decision = await checkAbuse("share", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  const parsed = createTicketSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation", fields: parsed.error.flatten().fieldErrors } },
      { status: 422 },
    );
  }

  try {
    const ticket = await createSupportTicket({
      userId: user.id,
      companyId: user.companyId,
      userEmail: user.email,
      userName: user.company.contactName ?? null,
      companyName: user.company.name,
      category: parsed.data.category,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
    return NextResponse.json({ id: ticket.id, number: ticket.number }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: { code: "method_not_allowed" } }, { status: 405 });
}
