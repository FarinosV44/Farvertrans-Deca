import { NextResponse } from "next/server";
import { requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { revokeTrustedDevice } from "@/lib/auth/trusted-device";
import { recordAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";

/** Revoke one trusted device — step-up gated (security configuration change). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireStepUp();
  } catch (e) {
    if (e instanceof StepUpRequiredError) {
      return NextResponse.json({ error: { code: "step_up_required" } }, { status: 403 });
    }
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const { id } = await params;
  await revokeTrustedDevice(user.id, id);
  await recordAudit({
    actorId: user.id,
    action: "admin_device_trust_revoked",
    targetType: "trusted_device",
    targetId: id,
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true });
}
