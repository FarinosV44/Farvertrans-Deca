import { NextResponse } from "next/server";
import { createEmailVerification, getCurrentUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

/** Resend the email-verification link (GROWTH #46 "Reenviar correo"). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Inicia sesión." } },
      { status: 401 },
    );
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, delivery: "already_verified" as const });
  }

  const abuse = await import("@/lib/abuse");
  const decision = await abuse.checkAbuse("auth", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const { abuseResponse } = await import("@/lib/abuse/response");
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  let delivery: "sent" | "unconfigured" | "error" = "unconfigured";
  let verifyTestToken: string | undefined;
  try {
    const { token } = await createEmailVerification(user.id, user.email);
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/verificar-email/${encodeURIComponent(token)}`;
    const { sendMail } = await import("@/lib/mailer");
    const { getDictionary } = await import("@/lib/i18n/server");
    const { isLocale, DEFAULT_LOCALE } = await import("@/lib/i18n/locale");
    const dict = await getDictionary(
      isLocale(user.preferredLocale) ? user.preferredLocale : DEFAULT_LOCALE,
    );
    const mail = await sendMail({
      to: user.email,
      subject: dict.emails.verifySubject(BRAND.name),
      text: dict.emails.verifyTextResend(BRAND.name, link),
    });
    delivery = mail.sent ? "sent" : (mail.reason ?? "unconfigured");
    if (!mail.sent) {
      console.warn(
        JSON.stringify({
          event: "verification_email_resend_failed",
          reason: mail.reason,
          userId: user.id,
        }),
      );
    }
    if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") verifyTestToken = token;
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "verification_email_resend_pipeline_failed",
        userId: user.id,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
  }

  return NextResponse.json({ ok: true, delivery, verifyTestToken });
}
