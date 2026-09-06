import { NextResponse } from "next/server";
import { requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { recordAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Disable TOTP for the current admin (Security screen "reset authenticator",
 * SECURITY #53 passkey follow-up) — step-up gated, symmetric to passkey
 * removal. Never lets the account end up with ZERO strong-auth methods: if
 * no passkey is registered either, the request is rejected rather than
 * silently locking the admin out of `/admin`. Clears the secret too, so a
 * later re-enrollment issues a brand-new one rather than reusing the old.
 */
export async function DELETE(req: Request) {
  let user;
  try {
    user = await requireStepUp();
  } catch (e) {
    if (e instanceof StepUpRequiredError) {
      return NextResponse.json({ error: { code: "step_up_required" } }, { status: 403 });
    }
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  if (!user.totpEnabledAt) {
    return NextResponse.json({ error: { code: "not_enrolled" } }, { status: 409 });
  }

  const passkeyCount = await prisma.webAuthnCredential.count({ where: { userId: user.id } });
  if (passkeyCount === 0) {
    return NextResponse.json(
      {
        error: {
          code: "last_method",
          message:
            "No puedes desactivar la app de autenticación sin tener también una clave de acceso configurada.",
        },
      },
      { status: 409 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabledAt: null, totpSecret: null },
  });
  await recordAudit({
    actorId: user.id,
    action: "admin_totp_reset",
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true });
}
