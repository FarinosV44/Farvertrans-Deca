import { NextResponse } from "next/server";
import { z } from "zod";
import { getInternalUser } from "@/lib/admin/guard";
import { verifyTotp } from "@/lib/auth/totp";
import { markTotpVerified } from "@/lib/auth";
import { consumeRecoveryCode } from "@/lib/auth/recovery-codes";
import { recordAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(6).max(11), // "123456" (TOTP) or "XXXX-XXXX" (recovery)
});

/**
 * Challenge an already-enrolled admin for a fresh TOTP code (SECURITY #53) —
 * used both at the post-login `/admin/2fa/verify` screen and to satisfy
 * step-up re-auth before a destructive action. Rate-limited: a 6-digit code
 * has too small a space to leave unthrottled. Also accepts one recovery
 * code as a fallback (single-use, consumed on success).
 */
export async function POST(req: Request) {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (!user.totpEnabledAt || !user.totpSecret) {
    return NextResponse.json({ error: { code: "not_enrolled" } }, { status: 409 });
  }

  const abuse = await import("@/lib/abuse");
  const decision = await abuse.checkAbuse("auth", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const { abuseResponse } = await import("@/lib/abuse/response");
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  }
  const code = parsed.data.code.trim();

  const isRecovery = code.includes("-");
  const ok = isRecovery
    ? await consumeRecoveryCode(user.id, code)
    : verifyTotp(user.totpSecret, code);

  if (!ok) {
    await recordAudit({
      actorId: user.id,
      action: isRecovery ? "admin_recovery_code_use" : "admin_2fa_verify",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json(
      { error: { code: "invalid_code", message: "Código incorrecto." } },
      { status: 400 },
    );
  }

  await markTotpVerified(user.id);
  await recordAudit({
    actorId: user.id,
    action: isRecovery ? "admin_recovery_code_use" : "admin_2fa_verify",
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true });
}
