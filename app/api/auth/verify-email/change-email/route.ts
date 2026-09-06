import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailVerification, getCurrentUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth/password";
import { requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email(), currentPassword: z.string().min(1).max(200) });

/**
 * Change the account's email before it has been verified (GROWTH #46 "Cambiar
 * correo electrónico") and immediately send a fresh confirmation to the new
 * address. A verified email is never silently swapped from this endpoint.
 * SECURITY #53: requires re-authentication (current password) — an admin
 * additionally needs a fresh TOTP check (step-up).
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
      { error: { code: "bad_input", message: "Indica un email válido y tu contraseña actual." } },
      { status: 422 },
    );
  }

  if (!user.passwordHash || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return NextResponse.json(
      { error: { code: "invalid_password", message: "Contraseña incorrecta." } },
      { status: 401 },
    );
  }
  if (user.role === "internal") {
    try {
      await requireStepUp();
    } catch (e) {
      if (e instanceof StepUpRequiredError) {
        return NextResponse.json({ error: { code: "step_up_required" } }, { status: 403 });
      }
      throw e;
    }
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
    const { getDictionary } = await import("@/lib/i18n/server");
    const { isLocale, DEFAULT_LOCALE } = await import("@/lib/i18n/locale");
    const dict = await getDictionary(
      isLocale(user.preferredLocale) ? user.preferredLocale : DEFAULT_LOCALE,
    );
    const mail = await sendMail({
      to: email,
      subject: dict.emails.verifySubject(BRAND.name),
      text: dict.emails.verifyTextChangeEmail(BRAND.name, link),
    });
    delivery = mail.sent ? "sent" : "unconfigured";
    if (process.env.FVD_EXPOSE_RESET_TOKEN === "1") verifyTestToken = token;
  } catch {
    // never leak internals
  }

  return NextResponse.json({ ok: true, email, delivery, verifyTestToken });
}
