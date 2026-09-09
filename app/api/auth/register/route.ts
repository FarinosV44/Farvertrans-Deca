import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, createEmailVerification, setSessionCookie, signup } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  // Real strength policy (length + complexity + email/company reuse) is
  // enforced in `signup()` (SECURITY #53) — this is only a sanity bound, so
  // a too-weak password surfaces its PRECISE reason, not a generic 422.
  password: z.string().min(1).max(200),
  companyName: z.string().trim().max(200).optional().default(""),
  companyNif: z.string().trim().max(20).optional().default(""),
  companyAddress: z.string().trim().max(300).optional().default(""),
  companyPostalCode: z.string().trim().max(12).optional().default(""),
  companyCity: z.string().trim().max(120).optional().default(""),
  companyContactName: z.string().trim().max(200).optional().default(""),
  companyPhone: z.string().trim().max(40).optional().default(""),
  companyEmail: z.string().trim().max(160).optional().default(""),
  companyProfile: z.enum(["carrier_goods", "shipper", "operator", "carrier_passengers"]).optional(),
  acceptTerms: z.boolean(),
  /** #84 — discreet, never required. `true` sets the company's commercial
   *  treatment to `all`; absent/`false` leaves it at `none`. */
  commercialOptIn: z.boolean().optional().default(false),
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

  // SECURITY #53 P0: registration had NO rate limiting — unbounded mass
  // account creation. Same shared "auth" policy as login/resend/password-reset.
  const abuse = await import("@/lib/abuse");
  const decision = await abuse.checkAbuse("auth", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const { abuseResponse } = await import("@/lib/abuse/response");
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  let created;
  try {
    created = await signup({
      email: b.email,
      password: b.password,
      company: {
        name: b.companyName,
        nif: b.companyNif,
        address: b.companyAddress,
        postalCode: b.companyPostalCode,
        city: b.companyCity,
        contactName: b.companyContactName,
        phone: b.companyPhone,
        email: b.companyEmail,
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

  // I18N #5: persist the browser's current locale as this account's
  // preference, so it comes back automatically on the next login.
  const { getLocale, getDictionary } = await import("@/lib/i18n/server");
  const locale = await getLocale();
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({ where: { id: created.userId }, data: { preferredLocale: locale } });
  } catch {
    // best-effort — never blocks registration
  }

  // Email verification (D-053): never blocks the ACCOUNT from existing, but
  // the client must never be told an email was sent when it was not — the
  // confirmation screen renders a different, honest state per `emailSent`.
  let verifyTestToken: string | undefined;
  let emailSent = false;
  try {
    const { token } = await createEmailVerification(created.userId, b.email);
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/verificar-email/${encodeURIComponent(token)}`;
    const { sendMail } = await import("@/lib/mailer");
    const { renderTransactionalHtml } = await import("@/lib/email-template");
    const dict = await getDictionary(locale);
    const text = dict.emails.verifyTextInitial(BRAND.name, link);
    const mail = await sendMail({
      to: b.email,
      subject: dict.emails.verifySubject(BRAND.name),
      text,
      html: renderTransactionalHtml({
        title: "Confirma tu correo electrónico",
        text,
        link,
        ctaLabel: "Confirmar correo",
      }),
    });
    emailSent = mail.sent;
    if (!mail.sent) {
      console.warn(
        JSON.stringify({
          event: "verification_email_not_sent",
          reason: mail.reason,
          userId: created.userId,
        }),
      );
    }
    // Test seam ONLY (E2E). Never set FVD_EXPOSE_RESET_TOKEN in production.
    if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") verifyTestToken = token;
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "verification_email_pipeline_failed",
        userId: created.userId,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
  }

  // Write acquisition attribution (first + last touch) from the first-party cookie.
  try {
    const { writeAcquisitionAtSignup } = await import("@/lib/attribution/persist");
    await writeAcquisitionAtSignup(created.userId, created.companyId);
  } catch {
    // attribution is best-effort — never block signup
  }

  // #84 — the discreet registration opt-in sets the global commercial treatment
  // to "all". Never required; a signup that joins a team (no own company) or
  // leaves it unticked is untouched.
  if (b.commercialOptIn && created.companyId && !created.joinedTeam) {
    try {
      const { setCommercialMode, setCommercialChannel } = await import("@/lib/consent");
      await setCommercialMode(created.companyId, "all", created.userId);
      // Default the channel to the company email so the opt-in is complete; the
      // owner can change it on /panel/privacidad.
      await setCommercialChannel(
        created.companyId,
        { channel: "email", contactEmail: b.companyEmail || b.email },
        created.userId,
      );
    } catch {
      // never block signup on the commercial-preference write
    }
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
        return NextResponse.json({ ok: true, claimWarning: e.message, emailSent }, { status: 201 });
      }
    }
  }

  return NextResponse.json(
    { ok: true, claimedDecaId, joinedTeam: created.joinedTeam, verifyTestToken, emailSent },
    { status: 201 },
  );
}
