import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, login, setSessionCookie } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  claim: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input", message: "Revisa los datos." } }, { status: 422 });
  }
  const b = parsed.data;

  let user;
  try {
    user = await login(b.email, b.password);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "internal", message: "Error al iniciar sesión." } }, { status: 500 });
  }

  await setSessionCookie(user.userId);

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

  return NextResponse.json({ ok: true }, { status: 200 });
}
