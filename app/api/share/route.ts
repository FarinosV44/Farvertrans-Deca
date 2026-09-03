import { NextResponse } from "next/server";
import { z } from "zod";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(16).max(128),
  to: z.string().email(),
});

/**
 * Email the DeCA public link to the driver (F9 / R-12). Rate-limited. Templated
 * envelope only — no user free-text (threat model T-10). Falls back with
 * `sent:false, reason:"unconfigured"` when transactional email is not set up.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input", message: "Email o documento no válidos." } }, { status: 422 });
  }

  const { checkAbuse } = await import("@/lib/abuse");
  const { abuseResponse } = await import("@/lib/abuse/response");
  const decision = await checkAbuse("share", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  const { prisma } = await import("@/lib/prisma");
  const version = await prisma.decaVersion.findUnique({ where: { token: parsed.data.token } });
  if (!version) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  const url = `${publicEnv.baseUrl}/d/${parsed.data.token}`;
  const { sendMail } = await import("@/lib/mailer");
  const result = await sendMail({
    to: parsed.data.to,
    subject: "Documento de control del transporte (DeCA)",
    text: `Documento electrónico de control (DeCA) del transporte.\n\nDescarga directa (sin registro):\n${url}\n\nEnviado a través de Farvertrans DeCA.`,
  });

  return NextResponse.json(
    { sent: result.sent, reason: result.reason, mailtoFallback: !result.sent ? url : undefined },
    { status: result.sent ? 200 : 202 },
  );
}
