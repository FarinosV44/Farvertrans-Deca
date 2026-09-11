import { NextResponse, after } from "next/server";
import { z } from "zod";
import { AuthError, createEmailVerification, setSessionCookie, signup } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { isMailConfigured } from "@/lib/mailer";

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

/**
 * D-204 (latency audit — LIVE INCIDENT: a customer thought registration had
 * failed after clicking once, purely from missing feedback + a slow
 * response). Every step below is timed and logged in one structured line so
 * a slow step is diagnosable from logs alone; see `docs/decisions.md`.
 */
export async function POST(req: Request) {
  const t0 = performance.now();
  const timings: Record<string, number> = {};
  const mark = (label: string, since: number) => {
    timings[label] = Math.round(performance.now() - since);
  };

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
  // This is a security gate, not deferrable — it must run before signup().
  let tStep = performance.now();
  const abuse = await import("@/lib/abuse");
  const decision = await abuse.checkAbuse("auth", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const { abuseResponse } = await import("@/lib/abuse/response");
  const blocked = abuseResponse(decision);
  mark("abuse_check_ms", tStep);
  if (blocked) return blocked;

  let created;
  tStep = performance.now();
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
  mark("signup_ms", tStep);

  await setSessionCookie(created.userId);

  const { getLocale, getDictionary } = await import("@/lib/i18n/server");
  const locale = await getLocale();

  // Email verification TOKEN is cheap (one transaction) and its content is
  // needed either way, so it stays on the critical path; the SEND (the
  // network call to Resend, previously up to 8s per D-192's timeout — by far
  // the largest single contributor to perceived latency) does not.
  tStep = performance.now();
  let verifyTestToken: string | undefined;
  let token: string | undefined;
  try {
    const r = await createEmailVerification(created.userId, b.email);
    token = r.token;
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
  mark("verify_token_create_ms", tStep);

  // Write acquisition attribution (first + last touch) from the first-party
  // cookie. NOT deferred (unlike the block below) — AC-23's operator report
  // and the growth dashboard read this immediately after signup, confirmed by
  // `tests/e2e/attribution.spec.ts` querying it right after `register()`
  // returns; deferring it raced and broke that guarantee.
  tStep = performance.now();
  try {
    const { writeAcquisitionAtSignup } = await import("@/lib/attribution/persist");
    await writeAcquisitionAtSignup(created.userId, created.companyId);
  } catch {
    // attribution is best-effort — never block signup
  }
  mark("attribution_write_ms", tStep);

  // #84 — the discreet registration opt-in. Never required; a signup that
  // joins a team (no own company) or leaves it unticked is untouched. Same
  // helper as the Google 2-step path so both persist an identical value
  // (D-193). NOT deferred — the very next screen (`/panel/privacidad`) must
  // already reflect it; confirmed by `commercial-consent.spec.ts` failing
  // when this was moved to background.
  if (b.commercialOptIn && created.companyId && !created.joinedTeam) {
    tStep = performance.now();
    try {
      const { applySignupCommercialOptIn } = await import("@/lib/consent");
      await applySignupCommercialOptIn(
        created.companyId,
        created.userId,
        b.companyEmail || b.email,
      );
    } catch {
      // best-effort
    }
    mark("commercial_opt_in_ms", tStep);
  }

  // Prospect onboarding link (GROWTH #28): link the company back to the
  // prospect and force the operator ref-code attribution so it survives to
  // the first DeCA. Kept synchronous alongside attribution above — same
  // `acquisition` row, same immediate-consistency expectation.
  if (created.prospectId && created.prospectRefCode) {
    tStep = performance.now();
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
    mark("prospect_attach_ms", tStep);
  }

  // D-204: only the truly invisible-to-the-client steps are deferred — the
  // email SEND (the network call to Resend, previously up to 8s per D-192's
  // timeout, by far the largest single contributor to perceived latency) and
  // the locale persist, both moved off the response's critical path via
  // Next's after() so a slow provider can never stall the account the user
  // is staring at a spinner for. Superseding D-053's exact synchronous
  // guarantee for the email step specifically (see decisions.md D-204): the
  // client now optimistically shows "revisa tu email" whenever mail is
  // configured, with the existing "Reenviar" button on that screen as the
  // safety net if delivery genuinely fails — never told "sent" when mail
  // isn't even configured (`isMailConfigured()` below IS synchronous).
  // Every OTHER best-effort write (attribution/opt-in/prospect-attach) turned
  // out to have an immediate-consistency requirement of its own — see the
  // comments above — and stayed on the critical path instead.
  after(async () => {
    const bg0 = performance.now();
    const bg: Record<string, number> = {};

    if (token) {
      const t = performance.now();
      try {
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
        if (!mail.sent) {
          console.warn(
            JSON.stringify({
              event: "verification_email_not_sent",
              reason: mail.reason,
              userId: created.userId,
            }),
          );
        }
      } catch (e) {
        console.error(
          JSON.stringify({
            event: "verification_email_pipeline_failed",
            userId: created.userId,
            error: e instanceof Error ? e.message : String(e),
          }),
        );
      }
      bg.email_send_ms = Math.round(performance.now() - t);
    }

    {
      // I18N #5: persist the browser's current locale as this account's
      // preference, so it comes back automatically on the next login.
      const t = performance.now();
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.update({
          where: { id: created.userId },
          data: { preferredLocale: locale },
        });
      } catch {
        // best-effort — never blocks registration
      }
      bg.locale_persist_ms = Math.round(performance.now() - t);
    }

    console.log(
      JSON.stringify({
        event: "register_background_timing",
        userId: created.userId,
        totalMs: Math.round(performance.now() - bg0),
        ...bg,
      }),
    );
  });

  // Attach the anonymous DeCA — an auth failure must never lose it. The
  // client uses `claimedDecaId` for tracking (`anonymous_deca_claimed`), so
  // this one genuinely needs to stay on the critical path.
  let claimedDecaId: string | undefined;
  const emailSent = isMailConfigured();
  tStep = performance.now();
  if (b.claim) {
    try {
      const r = await claimDeca(b.claim, created.companyId, created.userId);
      claimedDecaId = r.decaId;
    } catch (e) {
      if (e instanceof ClaimError) {
        mark("claim_ms", tStep);
        console.log(
          JSON.stringify({
            event: "register_timing",
            userId: created.userId,
            totalMs: Math.round(performance.now() - t0),
            ...timings,
          }),
        );
        return NextResponse.json({ ok: true, claimWarning: e.message, emailSent }, { status: 201 });
      }
    }
  }
  mark("claim_ms", tStep);

  console.log(
    JSON.stringify({
      event: "register_timing",
      userId: created.userId,
      totalMs: Math.round(performance.now() - t0),
      ...timings,
    }),
  );

  return NextResponse.json(
    { ok: true, claimedDecaId, joinedTeam: created.joinedTeam, verifyTestToken, emailSent },
    { status: 201 },
  );
}
