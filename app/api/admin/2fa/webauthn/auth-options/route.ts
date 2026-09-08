import { NextResponse } from "next/server";
import { getInternalUser } from "@/lib/admin/guard";
import { buildAuthenticationOptions } from "@/lib/auth/webauthn";
import {
  createWebAuthnChallenge,
  WEBAUTHN_CHALLENGE_COOKIE,
  WEBAUTHN_CHALLENGE_COOKIE_OPTIONS,
} from "@/lib/auth/webauthn-challenge";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Start a passkey login/step-up challenge (SECURITY #53 passkey follow-up).
 * `allowCredentials` is scoped to this user's own registered passkeys, so
 * the browser's picker only ever offers a credential that's actually theirs.
 */
export async function POST() {
  const user = await getInternalUser();
  if (!user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId: user.id },
    select: { credentialId: true, transports: true },
  });
  if (credentials.length === 0) {
    return NextResponse.json({ error: { code: "no_passkeys" } }, { status: 409 });
  }

  const options = await buildAuthenticationOptions({
    allowCredentialIds: credentials.map((c) => ({
      id: c.credentialId,
      transports: c.transports?.split(",").filter(Boolean),
    })),
  });

  // #91: a breadcrumb for the "stuck on connecting" report — an options line
  // with no matching `admin_passkey_verify` audit row soon after means the
  // ceremony never completed on the client. No secret, no challenge value.
  console.info(
    JSON.stringify({
      event: "admin_passkey_auth_options",
      userId: user.id,
      credentials: credentials.length,
      ts: new Date().toISOString(),
    }),
  );

  const res = NextResponse.json(options);
  res.cookies.set(
    WEBAUTHN_CHALLENGE_COOKIE,
    createWebAuthnChallenge(options.challenge, user.id),
    WEBAUTHN_CHALLENGE_COOKIE_OPTIONS,
  );
  return res;
}
