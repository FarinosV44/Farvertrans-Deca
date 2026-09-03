import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, setSessionCookie, signup } from "@/lib/auth";
import { claimDeca, ClaimError } from "@/lib/deca/claim";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  companyName: z.string().trim().min(2).max(200),
  companyNif: z.string().trim().min(3).max(20),
  companyAddress: z.string().trim().max(300).optional().default(""),
  claim: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_input", message: "Revisa los datos del formulario." } },
      { status: 422 },
    );
  }
  const b = parsed.data;

  let created;
  try {
    created = await signup({
      email: b.email,
      password: b.password,
      company: { name: b.companyName, nif: b.companyNif, address: b.companyAddress },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 409 });
    }
    return NextResponse.json(
      { error: { code: "internal", message: "No se pudo crear la cuenta. Inténtalo de nuevo." } },
      { status: 500 },
    );
  }

  await setSessionCookie(created.userId);

  // Write acquisition attribution (first + last touch) from the first-party cookie.
  try {
    const { writeAcquisitionAtSignup } = await import("@/lib/attribution/persist");
    await writeAcquisitionAtSignup(created.userId, created.companyId);
  } catch {
    // attribution is best-effort — never block signup
  }

  // Attach the anonymous DeCA — an auth failure must never lose it.
  let claimedDecaId: string | undefined;
  if (b.claim) {
    try {
      const r = await claimDeca(b.claim, created.companyId, created.userId);
      claimedDecaId = r.decaId;
    } catch (e) {
      if (e instanceof ClaimError) {
        return NextResponse.json({ ok: true, claimWarning: e.message }, { status: 201 });
      }
    }
  }

  return NextResponse.json({ ok: true, claimedDecaId }, { status: 201 });
}
