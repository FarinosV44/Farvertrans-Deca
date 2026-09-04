import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, createEmailVerification, setSessionCookie, signup } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  companyName: z.string().trim().max(200).optional().default(""),
  companyNif: z.string().trim().max(20).optional().default(""),
  companyAddress: z.string().trim().max(300).optional().default(""),
  companyContactName: z.string().trim().max(200).optional().default(""),
  companyPhone: z.string().trim().max(40).optional().default(""),
  companyProfile: z.enum(["carrier_goods", "shipper", "operator", "carrier_passengers"]).optional(),
  acceptTerms: z.boolean(),
  claim: z.string().trim().max(200).optional(),
  invite: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );
  }
  const b = parsed.data;

  let created;
  try {
    created = await signup({
      email: b.email,
      password: b.password,
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
  } catch (e) {
    if (e instanceof AuthError) {
      const status = e.code === "terms_required" ? 422 : 409;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo crear la cuenta. Inténtalo de nuevo." } },
      { status: 500 },
    );
  }

  await setSessionCookie(created.userId);

  // Email verification (GROWTH #46) — best-effort, never blocks the account
  // from existing; the confirmation screen handles an unconfigured provider.
  let verifyTestToken: string | undefined;
  try {
    const { token } = await createEmailVerification(created.userId, b.email);
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/verificar-email/${encodeURIComponent(token)}`;
    const { sendMail } = await import("@/lib/mailer");
    await sendMail({
      to: b.email,
      subject: `Confirma tu correo en ${BRAND.name}`,
      text: `Ya casi está. Confirma tu correo para activar tu cuenta de ${BRAND.name}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
    });
    // Test seam ONLY (E2E). Never set FVD_EXPOSE_RESET_TOKEN in production.
    if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") verifyTestToken = token;
  } catch {
    // never block signup on a mail-provider hiccup
  }

  // Write acquisition attribution (first + last touch) from the first-party cookie.
  try {
    const { writeAcquisitionAtSignup } = await import("@/lib/attribution/persist");
    await writeAcquisitionAtSignup(created.userId, created.companyId);
  } catch {
    // attribution is best-effort — never block signup
  }

  // Prospect onboarding link (GROWTH #28): link the company back to the prospect
  // and force the operator ref-code attribution so it survives to the first DeCA.
  if (created.prospectId && created.prospectRefCode) {
    try {
      const [{ attachCompanyToProspect }, { prisma }] = await Promise.all([
        import("@/lib/growth"),
        import("@/lib/prisma"),
      ]);
      await attachCompanyToProspect(created.prospectId, created.companyId);
      await prisma.acquisition.update({
        where: { companyId: created.companyId },
        data: { firstRefCode: created.prospectRefCode, lastRefCode: created.prospectRefCode },
      });
    } catch {
      // best-effort
    }
  }

  // Attach the anonymous DeCA — an auth failure must never lose it.
  let claimedDecaId: string | undefined;
  if (b.claim) {
    try {
      const r = await claimDeca(b.claim, created.companyId, created.userId);
      claimedDecaId = r.decaId;
    } catch (e) {
      if (e instanceof ClaimError) {
        return NextResponse.json({ ok: true, claimWarning: e.message }, { status: 201 });
      }
    }
  }

  return NextResponse.json(
    { ok: true, claimedDecaId, joinedTeam: created.joinedTeam, verifyTestToken },
    { status: 201 },
  );
}
