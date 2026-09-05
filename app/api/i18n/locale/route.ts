import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE, LOCALES } from "@/lib/i18n/locale";

export const runtime = "nodejs";

const schema = z.object({ locale: z.enum(LOCALES) });

/**
 * Sets the viewer's `fvd_locale` preference (the language switcher). When
 * signed in, also persists it to `User.preferredLocale` (I18N #5) so it comes
 * back automatically on the next login from any device/browser.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  }
  const { locale } = parsed.data;

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (user) {
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.update({ where: { id: user.id }, data: { preferredLocale: locale } });
    }
  } catch {
    // best-effort — the cookie switch itself must never fail on this
  }

  return res;
}
