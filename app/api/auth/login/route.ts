import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, login, setSessionCookie } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  claim: z.string().trim().max(200).optional(),
  invite: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos." } },
      { status: 422 },
    );
  }
  const b = parsed.data;

  let user;
  try {
    user = await login(b.email, b.password);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 401 });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "Error al iniciar sesión." } },
      { status: 500 },
    );
  }

  await setSessionCookie(user.userId);

  // I18N #5: restore this account's saved language preference automatically.
  if (isLocale(user.preferredLocale)) {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    store.set(LOCALE_COOKIE, user.preferredLocale, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  let joinedTeam = false;
  if (b.invite) {
    try {
      const { acceptInvite } = await import("@/lib/team");
      await acceptInvite(b.invite, user.userId);
      joinedTeam = true;
    } catch {
      // an invalid invite must not block a valid login
    }
  }

  if (b.claim) {
    try {
      const { getCurrentUser } = await import("@/lib/auth");
      const full = await getCurrentUser();
      if (full?.companyId) await claimDeca(b.claim, full.companyId, full.id);
    } catch (e) {
      if (e instanceof ClaimError) {
        return NextResponse.json({ ok: true, claimWarning: e.message }, { status: 200 });
      }
    }
  }

  return NextResponse.json({ ok: true, joinedTeam }, { status: 200 });
}
