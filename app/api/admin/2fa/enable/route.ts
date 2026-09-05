import { NextResponse } from "next/server";
import { z } from "zod";
import { getInternalUser } from "@/lib/admin/guard";
import { verifyTotp } from "@/lib/auth/totp";
import { markTotpVerified } from "@/lib/auth";
import { generateRecoveryCodes } from "@/lib/auth/recovery-codes";
import { recordAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ code: z.string().trim().length(6) });

/**
 * Complete admin TOTP enrollment (SECURITY #53): "verify one valid code
 * before enabling 2FA". Only after this succeeds does `totpEnabledAt` get
 * set — a scanned-but-unconfirmed secret never counts as enrolled. Issues
 * the one-time recovery codes here too, since this is the only moment the
 * account is guaranteed to still be mid-setup (never reachable again the
 * same way — regeneration later requires step-up).
 */
export async function POST(req: Request) {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.totpEnabledAt) {
    return NextResponse.json({ error: { code: "already_enrolled" } }, { status: 409 });
  }
  if (!user.totpSecret) {
    return NextResponse.json({ error: { code: "not_enrolled" } }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  }

  if (!verifyTotp(user.totpSecret, parsed.data.code)) {
    await recordAudit({
      actorId: user.id,
      action: "admin_2fa_enroll",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "invalid_code" } }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { totpEnabledAt: new Date() } });
  const recoveryCodes = await generateRecoveryCodes(user.id);
  await markTotpVerified(user.id);
  await recordAudit({
    actorId: user.id,
    action: "admin_2fa_enroll",
    result: "success",
    headers: req.headers,
  });

  return NextResponse.json({ ok: true, recoveryCodes });
}
