import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

/**
 * Start a password reset (ACCOUNT #23). Always returns 200 with the same body —
 * never reveals whether the email is registered. Sends the reset link when
 * transactional email is configured; otherwise reports it so the UI can say so.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: true, delivery: "unknown" }, { status: 200 });
  }

  let delivery: "sent" | "unconfigured" | "unknown" = "unknown";
  try {
    const abuse = await import("@/lib/abuse");
    const decision = await abuse.checkAbuse("auth", req.headers, {
      fingerprint: req.headers.get("x-fvd-fp"),
      challengeToken: req.headers.get("x-fvd-challenge"),
    });
    const { abuseResponse } = await import("@/lib/abuse/response");
    const blocked = abuseResponse(decision);
    if (blocked) return blocked;

    const result = await requestPasswordReset(parsed.data.email);
    if (result) {
      const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/recuperar/${encodeURIComponent(result.token)}`;
      const { sendMail } = await import("@/lib/mailer");
      const mail = await sendMail({
        to: result.email,
        subject: `Recupera el acceso a ${BRAND.name}`,
        text: `Has pedido restablecer tu contraseña de ${BRAND.name}.\n\nAbre este enlace (caduca en 1 hora):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
      });
      delivery = mail.sent ? "sent" : "unconfigured";

      // Test seam ONLY (E2E). Never set FVD_EXPOSE_RESET_TOKEN in production.
      if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") {
        return NextResponse.json({ ok: true, delivery, testToken: result.token }, { status: 200 });
      }
    }
  } catch {
    // never leak internals
  }

  return NextResponse.json({ ok: true, delivery }, { status: 200 });
}
