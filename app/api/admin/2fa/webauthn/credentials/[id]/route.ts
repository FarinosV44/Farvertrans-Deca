import { NextResponse } from "next/server";
import { requireStepUp, StepUpRequiredError } from "@/lib/admin/guard";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Remove one of the current admin's own passkeys — step-up gated (security
 * configuration change, SECURITY #53). Never lets the account end up with
 * ZERO strong-auth methods: if this is the last passkey and TOTP isn't
 * enabled either, the request is rejected rather than silently locking the
 * admin out of `/admin` entirely.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let stepped;
  try {
    stepped = await requireStepUp();
  } catch (e) {
    if (e instanceof StepUpRequiredError) {
      return NextResponse.json({ error: { code: "step_up_required" } }, { status: 403 });
    }
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const { id } = await params;
  const credential = await prisma.webAuthnCredential.findUnique({ where: { id } });
  if (!credential || credential.userId !== stepped.id) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }

  if (!user.totpEnabledAt) {
    const otherCount = await prisma.webAuthnCredential.count({
      where: { userId: stepped.id, id: { not: id } },
    });
    if (otherCount === 0) {
      return NextResponse.json(
        {
          error: {
            code: "last_method",
            message:
              "No puedes quitar tu última clave de acceso sin tener también un autenticador TOTP configurado.",
          },
        },
        { status: 409 },
      );
    }
  }

  await prisma.webAuthnCredential.delete({ where: { id } });
  await recordAudit({
    actorId: stepped.id,
    action: "admin_passkey_removed",
    targetType: "webauthn_credential",
    targetId: id,
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true });
}
