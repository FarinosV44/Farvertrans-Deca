import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { setCommercialConsent } from "@/lib/consent";

export const runtime = "nodejs";

const bodySchema = z.object({ granted: z.boolean() });

/**
 * Grant/revoke the company's commercial route-offer consent (DATA #45 §3).
 * Owner-only — this is a company-wide preference, not a per-member setting.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: { code: "validation" } }, { status: 422 });

  const state = await setCommercialConsent(user.companyId, parsed.data.granted);
  return NextResponse.json({ consent: state });
}
