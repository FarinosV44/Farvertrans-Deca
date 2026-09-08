import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { opportunityUpdateSchema } from "@/lib/commercial/opportunity-model";
import { setOpportunityState } from "@/lib/commercial/opportunities";

export const runtime = "nodejs";

/**
 * Set the internal commercial follow-up state (or note) for a carrier from the
 * `Oportunidades` radar (#87). 404 (never 403) for a non-internal caller — the
 * area is undiscoverable. Refuses a company with no active `CommercialConsent`.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const { companyId } = await params;
  const parsed = opportunityUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });
  }

  try {
    await setOpportunityState(companyId, parsed.data, admin.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "not_eligible") {
      return NextResponse.json({ error: { code: "not_eligible" } }, { status: 409 });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
