import { NextResponse } from "next/server";
import { getInternalUser } from "@/lib/admin/guard";
import { generateTotpSecret, otpauthUri } from "@/lib/auth/totp";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

export const runtime = "nodejs";

/**
 * Start (or restart) admin TOTP enrollment (SECURITY #53). Idempotent: an
 * internal user who already has an unconfirmed secret gets the SAME one
 * back (so refreshing the setup page doesn't invalidate a QR they already
 * scanned) — a brand-new secret is only generated the first time, or after
 * `POST /2fa/enable` fails to ever get called and they restart later.
 * Never returns anything once `totpEnabledAt` is already set.
 */
export async function POST() {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.totpEnabledAt) {
    return NextResponse.json({ error: { code: "already_enrolled" } }, { status: 409 });
  }

  const secret = user.totpSecret ?? generateTotpSecret();
  if (!user.totpSecret) {
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
  }

  const uri = otpauthUri(secret, user.email, BRAND.name);
  const { qrPngDataUri } = await import("@/lib/pdf/qr");
  const qrDataUri = await qrPngDataUri(uri);

  return NextResponse.json({ secret, qrDataUri });
}
