import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword, ResetError, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(16).max(200),
  // Real strength policy is enforced in `resetPassword()` (SECURITY #53) —
  // this is only a sanity bound, so a too-weak password surfaces its
  // precise reason, not a generic 422.
  password: z.string().min(1).max(200),
});

/** Complete a password reset (ACCOUNT #23). On success the user is logged in. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );
  }

  try {
    const { userId } = await resetPassword(parsed.data.token, parsed.data.password);
    await setSessionCookie(userId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    if (e instanceof ResetError) {
      const status = e.code === "weak_password" ? 422 : 400;
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo restablecer la contraseña." } },
      { status: 500 },
    );
  }
}
