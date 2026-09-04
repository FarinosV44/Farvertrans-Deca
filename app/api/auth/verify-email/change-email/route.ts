import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailVerification, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

/**
 * Change the account's email before it has been verified (GROWTH #46 "Cambiar
 * correo electrónico") and immediately send a fresh confirmation to the new
 * address. A verified email is never silently swapped from this endpoint.
 */
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
      { error: { code: "bad_input", message: "Indica un email válido." } },
      { status: 422 },
    );
  }
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json(
      { error: { code: "email_taken", message: "Ya existe una cuenta con este email." } },
      { status: 409 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email, emailVerifiedAt: null },
  });

  let delivery: "sent" | "unconfigured" = "unconfigured";
  let verifyTestToken: string | undefined;
  try {
    const { token } = await createEmailVerification(user.id, email);
    const link = `${publicEnv.baseUrl.replace(/\/$/, "")}/verificar-email/${encodeURIComponent(token)}`;
    const { sendMail } = await import("@/lib/mailer");
    const mail = await sendMail({
      to: email,
      subject: `Confirma tu correo en ${BRAND.name}`,
      text: `Confirma tu nuevo correo para activar tu cuenta de ${BRAND.name}.\n\nAbre este enlace (caduca en 24 horas):\n${link}\n\nSi no has sido tú, ignora este mensaje.`,
    });
    delivery = mail.sent ? "sent" : "unconfigured";
    if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") verifyTestToken = token;
  } catch {
    // never leak internals
  }

  return NextResponse.json({ ok: true, email, delivery, verifyTestToken });
}
