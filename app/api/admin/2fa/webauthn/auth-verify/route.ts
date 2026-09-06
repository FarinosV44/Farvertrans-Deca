import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { getInternalUser } from "@/lib/admin/guard";
import { verifyAuthentication } from "@/lib/auth/webauthn";
import { WEBAUTHN_CHALLENGE_COOKIE, verifyWebAuthnChallenge } from "@/lib/auth/webauthn-challenge";
import { markTotpVerified } from "@/lib/auth";
import { recordAudit } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ response: z.record(z.string(), z.unknown()) });

/**
 * Complete a passkey login/step-up challenge — same rate-limited "auth"
 * abuse policy as the TOTP verify route, since this is exactly as sensitive
 * (proving admin identity). On success this satisfies the same freshness
 * check TOTP does (`markTotpVerified` sets the same `tv` session field —
 * `requireInternal()` doesn't care which method produced it).
 */
export async function POST(req: Request) {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const abuse = await import("@/lib/abuse");
  const decision = await abuse.checkAbuse("auth", req.headers, {
    fingerprint: req.headers.get("x-fvd-fp"),
    challengeToken: req.headers.get("x-fvd-challenge"),
  });
  const { abuseResponse } = await import("@/lib/abuse/response");
  const blocked = abuseResponse(decision);
  if (blocked) return blocked;

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

  const response = parsed.data.response as unknown as AuthenticationResponseJSON;
  const stored = await prisma.webAuthnCredential.findUnique({
    where: { credentialId: response.id },
  });
  if (!stored || stored.userId !== user.id) {
    await recordAudit({
      actorId: user.id,
      action: "admin_passkey_verify",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "invalid_credential" } }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthentication({
      response,
      expectedChallenge,
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(stored.publicKey),
        counter: Number(stored.counter),
        transports: stored.transports?.split(",").filter(Boolean),
      },
    });
  } catch {
    await recordAudit({
      actorId: user.id,
      action: "admin_passkey_verify",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "verification_failed" } }, { status: 400 });
  }

  if (!verification.verified) {
    await recordAudit({
      actorId: user.id,
      action: "admin_passkey_verify",
      result: "failure",
      headers: req.headers,
    });
    return NextResponse.json({ error: { code: "verification_failed" } }, { status: 400 });
  }

  // Replay protection: the counter must strictly increase; persist it and
  // the last-used timestamp regardless of anything else below.
  await prisma.webAuthnCredential.update({
    where: { id: stored.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter), lastUsedAt: new Date() },
  });

  await markTotpVerified(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(WEBAUTHN_CHALLENGE_COOKIE);

  await recordAudit({
    actorId: user.id,
    action: "admin_passkey_verify",
    result: "success",
    headers: req.headers,
  });

  return res;
}
