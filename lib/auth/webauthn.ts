import "server-only";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential as SimpleWebAuthnCredential,
} from "@simplewebauthn/server";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

/**
 * WebAuthn/passkey admin 2FA (SECURITY #53 passkey follow-up) — the primary
 * method now, alongside TOTP as a fallback (`lib/auth/totp.ts`, unchanged).
 * Thin wrappers around `@simplewebauthn/server` with this app's relying-
 * party identity pre-filled, so every route calls the same config rather
 * than re-deriving it. No new environment variable: the RP ID and origin
 * come straight from `NEXT_PUBLIC_FVD_BASE_URL`, which already exists —
 * `decaprofesional.es` in production, `localhost` in dev.
 */

export function relyingParty(): { rpID: string; rpName: string; origin: string } {
  const origin = publicEnv.baseUrl;
  const rpID = new URL(origin).hostname;
  return { rpID, rpName: BRAND.name, origin };
}

/** A credential exactly as `@simplewebauthn/server` needs it — build this from the stored DB row. */
export type StoredCredential = SimpleWebAuthnCredential;

/**
 * Registration options for adding a new passkey. `preferredAuthenticatorType:
 * "localDevice"` is what nudges the browser toward Face ID/Touch ID/Windows
 * Hello over a physical security key (the brief's explicit iPhone-first UX).
 */
export async function buildRegistrationOptions(opts: {
  userId: string;
  userEmail: string;
  existingCredentialIds: string[];
}) {
  const { rpID, rpName } = relyingParty();
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName: opts.userEmail,
    userID: Buffer.from(opts.userId),
    attestationType: "none",
    excludeCredentials: opts.existingCredentialIds.map((id) => ({ id })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    preferredAuthenticatorType: "localDevice",
  });
}

export async function verifyRegistration(opts: {
  response: RegistrationResponseJSON;
  expectedChallenge: string;
}): Promise<VerifiedRegistrationResponse> {
  const { rpID, origin } = relyingParty();
  return verifyRegistrationResponse({
    response: opts.response,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
}

/**
 * Authentication options for a login/step-up challenge. `allowCredentials`
 * is deliberately the user's OWN registered credentials only — the browser
 * then only offers to unlock a passkey that's actually theirs, never a
 * generic "choose any passkey" prompt.
 */
export async function buildAuthenticationOptions(opts: {
  allowCredentialIds: { id: string; transports?: string[] }[];
}) {
  const { rpID } = relyingParty();
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: opts.allowCredentialIds,
    userVerification: "preferred",
    // #91: an explicit ceiling the browser passes to the authenticator so the
    // ceremony cannot sit on "connecting…" indefinitely. The client also races
    // it against its own timeout as a backstop.
    timeout: 60_000,
  });
}

export async function verifyAuthentication(opts: {
  response: AuthenticationResponseJSON;
  expectedChallenge: string;
  credential: StoredCredential;
}): Promise<VerifiedAuthenticationResponse> {
  const { rpID, origin } = relyingParty();
  return verifyAuthenticationResponse({
    response: opts.response,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: opts.credential,
  });
}
