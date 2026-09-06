import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { getInternalUser } from "@/lib/admin/guard";
import { verifyRegistration } from "@/lib/auth/webauthn";
import { WEBAUTHN_CHALLENGE_COOKIE, verifyWebAuthnChallenge } from "@/lib/auth/webauthn-challenge";
import { markTotpVerified } from "@/lib/auth";
import { generateRecoveryCodes, countUnusedRecoveryCodes } from "@/lib/auth/recovery-codes";
import { recordAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  response: z.record(z.string(), z.unknown()),
  name: z.string().trim().max(80).optional(),
});

/**
 * Complete passkey registration. Stores only the public key + metadata the
 * browser already handed back — the private key never leaves the
 * authenticator (SECURITY #53's "store only necessary public credential
 * information"). Recovery codes are (re-)issued here ONLY the first time
 * this account gets ANY strong-auth method (no existing passkey, no TOTP)
 * — adding a second passkey later, or adding a passkey after TOTP was
 * already set up, never silently invalidates codes the admin already saved.
 */
export async function POST(req: Request) {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const store = await cookies();
  const expectedChallenge = verifyWebAuthnChallenge(
    store.get(WEBAUTHN_CHALLENGE_COOKIE)?.value,
    user.id,
  );
  if (!expectedChallenge) {
    return NextResponse.json({ error: { code: "challenge_expired" } }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_input" } }, { status: 422 });
  }

  let verification;
  try {
    verification = await verifyRegistration({
      response: parsed.data.response as unknown as RegistrationResponseJSON,
      expectedChallenge,
    });
  } catch {
    await recordAudit({
      actorId: user.id,
      action: "admin_passkey_register",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "verification_failed" } }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    await recordAudit({
      actorId: user.id,
      action: "admin_passkey_register",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "verification_failed" } }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  const hadAnyStrongAuth =
    !!user.totpEnabledAt ||
    (await prisma.webAuthnCredential.count({ where: { userId: user.id } })) > 0;

  await prisma.webAuthnCredential.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: BigInt(credential.counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.transports?.join(",") ?? null,
      name: parsed.data.name ?? "Passkey",
    },
  });

  let recoveryCodes: string[] | undefined;
  if (!hadAnyStrongAuth || (await countUnusedRecoveryCodes(user.id)) === 0) {
    recoveryCodes = await generateRecoveryCodes(user.id);
  }

  await markTotpVerified(user.id);
  const res = NextResponse.json({ ok: true, recoveryCodes });
  res.cookies.delete(WEBAUTHN_CHALLENGE_COOKIE);

  await recordAudit({
    actorId: user.id,
    action: "admin_passkey_register",
    result: "success",
    headers: req.headers,
  });

  return res;
}
