import { NextResponse } from "next/server";
import { getInternalUser } from "@/lib/admin/guard";
import { buildRegistrationOptions } from "@/lib/auth/webauthn";
import {
  createWebAuthnChallenge,
  WEBAUTHN_CHALLENGE_COOKIE,
  WEBAUTHN_CHALLENGE_COOKIE_OPTIONS,
} from "@/lib/auth/webauthn-challenge";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Start registering a new passkey (SECURITY #53 passkey follow-up) — the
 * primary 2FA method now, usable both at first-time enrollment (no 2FA set
 * up yet at all) and later from the security screen to add another device.
 * Same authorization level as the existing TOTP `enroll` route
 * (`getInternalUser()`, not `requireInternal()`) since this must work
 * BEFORE any 2FA is enrolled.
 */
export async function POST() {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const existing = await prisma.webAuthnCredential.findMany({
    where: { userId: user.id },
    select: { credentialId: true },
  });

  const options = await buildRegistrationOptions({
    userId: user.id,
    userEmail: user.email,
    existingCredentialIds: existing.map((c) => c.credentialId),
  });

  const res = NextResponse.json(options);
  res.cookies.set(
    WEBAUTHN_CHALLENGE_COOKIE,
    createWebAuthnChallenge(options.challenge, user.id),
    WEBAUTHN_CHALLENGE_COOKIE_OPTIONS,
  );
  return res;
}
