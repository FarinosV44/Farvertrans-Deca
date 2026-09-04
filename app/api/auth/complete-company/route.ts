import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, completeCompanyForUser, getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  companyName: z.string().trim().max(200).optional().default(""),
  companyNif: z.string().trim().max(20).optional().default(""),
  companyAddress: z.string().trim().max(300).optional().default(""),
  companyContactName: z.string().trim().max(200).optional().default(""),
  companyPhone: z.string().trim().max(40).optional().default(""),
  companyProfile: z.enum(["carrier_goods", "shipper", "operator", "carrier_passengers"]).optional(),
  acceptTerms: z.boolean(),
  invite: z.string().trim().max(200).optional(),
});

/** Step 2 of Google sign-up (AUTH #30): attach a company to an existing, company-less account. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Inicia sesión." } },
      { status: 401 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );
  }
  const b = parsed.data;

  try {
    const result = await completeCompanyForUser(user.id, {
      company: {
        name: b.companyName,
        nif: b.companyNif,
        address: b.companyAddress,
        contactName: b.companyContactName,
        phone: b.companyPhone,
        profile: b.companyProfile,
      },
      inviteToken: b.invite,
      acceptTerms: b.acceptTerms,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof AuthError) {
      const status = e.code === "terms_required" ? 422 : 400;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo completar el registro." } },
      { status: 500 },
    );
  }
}
