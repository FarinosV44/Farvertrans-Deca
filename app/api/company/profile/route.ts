import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  contactName: z.string().trim().max(200).optional().or(z.literal("")),
});

/**
 * Update the company's contact profile (email/phone/address/contact name) —
 * owner-only, a company-wide setting like the logo (PRODUCT #39), not a
 * per-member preference. An empty string clears a field (all four are
 * optional at signup and stay optional here).
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );

  const b = parsed.data;
  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: {
      email: b.email ? b.email : null,
      phone: b.phone ? b.phone : null,
      address: b.address ? b.address : null,
      contactName: b.contactName ? b.contactName : null,
    },
    select: { email: true, phone: true, address: true, contactName: true },
  });

  return NextResponse.json({ ok: true, company });
}
