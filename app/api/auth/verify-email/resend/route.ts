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
    const mail = await sendMail({
      to: user.email,
      subject: `Confirma tu correo en ${BRAND.name}`,
      text: `Confirma tu correo para activar tu cuenta de ${BRAND.name}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
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
