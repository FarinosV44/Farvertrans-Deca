import { NextResponse } from "next/server";
import { z } from "zod";
import { getInternalUser } from "@/lib/admin/guard";
import { markTotpVerified } from "@/lib/auth";
import { recordAudit } from "@/lib/admin/audit";
import {
  backupAttemptsExceeded,
  backupPasswordConfigured,
  checkBackupPassword,
  clearBackupFailures,
  recordBackupFailure,
} from "@/lib/admin/backup-password";

export const runtime = "nodejs";

const schema = z.object({ password: z.string().min(1).max(200) });

/**
 * Super Admin backup-password verification (#91). Satisfies ONLY the extra
 * Super Admin strong-auth step for an admin who is already normally logged in —
 * it never replaces the app login. On success it sets the exact same `tv`
 * session state as the TOTP/passkey path (`markTotpVerified`). Every failure
 * mode returns the same generic error so nothing is leaked; repeated failures
 * are locked out per admin.
 */
export async function POST(req: Request) {
  const user = await getInternalUser();
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const generic = () =>
    NextResponse.json(
      { error: { code: "invalid_code", message: "No se pudo verificar. Inténtalo de nuevo." } },
      { status: 400 },
    );

  // Lockout: too many recent failed attempts for this admin.
  if (await backupAttemptsExceeded(user.id)) {
    await recordAudit({
      actorId: user.id,
      action: "admin_backup_password",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json(
      {
        error: {
          code: "too_many_attempts",
          message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
        },
      },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return generic();

  // A missing SUPERADMIN_BACKUP_PASSWORD looks exactly like a wrong password to
  // the client — never reveal whether the feature is configured.
  const ok = backupPasswordConfigured() && checkBackupPassword(parsed.data.password);
  if (!ok) {
    await recordBackupFailure(user.id);
    await recordAudit({
      actorId: user.id,
      action: "admin_backup_password",
      result: "failure",
      headers: req.headers,
    });
    return generic();
  }

  await clearBackupFailures(user.id);
  await markTotpVerified(user.id);
  await recordAudit({
    actorId: user.id,
    action: "admin_backup_password",
    result: "success",
    headers: req.headers,
  });
  return NextResponse.json({ ok: true });
}
