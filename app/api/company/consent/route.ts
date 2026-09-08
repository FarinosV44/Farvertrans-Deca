import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { setCommercialMode, setCommercialChannel, revokeCommercial } from "@/lib/consent";

export const runtime = "nodejs";

/**
 * Set the company's commercial-treatment preference (#84). Owner-only — a
 * company-wide preference, not a per-member setting. Three shapes:
 *  - `{ mode }`                             — none | per_deca | all
 *  - `{ channel, contactEmail?, contactPhone? }` — authorised contact channel
 *  - `{ action: "revoke" }`                 — retire the global authorisation
 * Free use of the product is never affected by this.
 */
const bodySchema = z.union([
  z.object({ mode: z.enum(["none", "per_deca", "all"]) }),
  z.object({
    channel: z.enum(["email", "phone", "both"]),
    contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  }),
  z.object({ action: z.literal("revoke") }),
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "validation", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );

  const body = parsed.data;
  let treatment;
  if ("mode" in body) {
    treatment = await setCommercialMode(user.companyId, body.mode, user.id);
  } else if ("channel" in body) {
    treatment = await setCommercialChannel(
      user.companyId,
      {
        channel: body.channel,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
      },
      user.id,
    );
  } else {
    treatment = await revokeCommercial(user.companyId, user.id);
  }
  return NextResponse.json({ treatment });
}
