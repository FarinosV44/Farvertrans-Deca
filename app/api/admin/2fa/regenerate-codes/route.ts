import { NextResponse } from "next/server";
import { requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { generateRecoveryCodes } from "@/lib/auth/recovery-codes";
import { recordAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

/**
 * Regenerate recovery codes — "allow regeneration only after
 * re-authentication" (SECURITY #53). Old codes are invalidated as part of
 * `generateRecoveryCodes()` itself.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireStepUp();
  } catch (e) {
    if (e instanceof StepUpRequiredError) {
      return NextResponse.json({ error: { code: "step_up_required" } }, { status: 403 });
    }
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const recoveryCodes = await generateRecoveryCodes(user.id);
  await recordAudit({
    actorId: user.id,
    action: "admin_recovery_codes_regenerated",
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true, recoveryCodes });
}
