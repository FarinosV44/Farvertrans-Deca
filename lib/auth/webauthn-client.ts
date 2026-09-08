"use client";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";

/**
 * Client-side passkey helpers shared by the setup screen, the verify
 * screen, and the Security settings screen — one place that talks to
 * `navigator.credentials` via `@simplewebauthn/browser`, so every caller
 * gets the same friendly error mapping (SECURITY #53 passkey follow-up,
 * brief item 9: "clear success/error messages").
 */

export { browserSupportsWebAuthn, platformAuthenticatorIsAvailable };

/** Hard ceilings so an authentication request NEVER hangs the UI (#91). */
const FETCH_TIMEOUT_MS = 15_000;
const CEREMONY_TIMEOUT_MS = 70_000; // slightly above the 60s WebAuthn `timeout`

class TimeoutError extends Error {
  constructor() {
    super("timeout");
    this.name = "TimeoutError";
  }
}

/** `fetch` that always settles — aborts (and rejects) after `FETCH_TIMEOUT_MS`. */
async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Race a promise against a timeout so `startAuthentication`/`startRegistration`
 *  can't leave the caller stuck on "Confirma en tu dispositivo…" forever (#91). */
function withCeremonyTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError()), CEREMONY_TIMEOUT_MS),
    ),
  ]);
}

function friendlyError(e: unknown): string {
  if (e instanceof TimeoutError) {
    return "Se agotó el tiempo de espera. Inténtalo de nuevo o usa tu código.";
  }
  const name = e instanceof Error ? e.name : "";
  if (name === "AbortError") {
    return "Se agotó el tiempo de espera. Inténtalo de nuevo o usa tu código.";
  }
  if (name === "NotAllowedError") {
    return "Cancelado o no se completó a tiempo. Inténtalo de nuevo.";
  }
  if (name === "InvalidStateError") {
    return "Esta clave de acceso ya está registrada en este dispositivo.";
  }
  if (name === "SecurityError") {
    return "No se pudo verificar el sitio. Recarga la página e inténtalo de nuevo.";
  }
  return "No se pudo completar con Face ID / clave de acceso. Inténtalo de nuevo.";
}

export type PasskeyResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Register a new passkey for the signed-in admin. */
export async function registerPasskey(
  name?: string,
): Promise<PasskeyResult<{ recoveryCodes?: string[] }>> {
  let optionsRes: Response;
  try {
    optionsRes = await fetchWithTimeout("/api/admin/2fa/webauthn/register-options", {
      method: "POST",
    });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
  if (!optionsRes.ok) {
    return { ok: false, error: "No se pudo iniciar el registro. Inténtalo de nuevo." };
  }
  const optionsJSON = await optionsRes.json();

  let response;
  try {
    response = await withCeremonyTimeout(startRegistration({ optionsJSON }));
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }

  let verifyRes: Response;
  try {
    verifyRes = await fetchWithTimeout("/api/admin/2fa/webauthn/register-verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ response, name }),
    });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
  const data = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok) {
    return { ok: false, error: "No se pudo guardar la clave de acceso. Inténtalo de nuevo." };
  }
  return { ok: true, data: { recoveryCodes: data.recoveryCodes } };
}

/**
 * Authenticate with an already-registered passkey (login challenge or step-up).
 * Every step has a hard timeout so the caller ALWAYS gets a result (#91) — no
 * request can leave the UI stuck on "Confirma en tu dispositivo…".
 */
export async function authenticateWithPasskey(): Promise<PasskeyResult<Record<string, never>>> {
  let optionsRes: Response;
  try {
    optionsRes = await fetchWithTimeout("/api/admin/2fa/webauthn/auth-options", { method: "POST" });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
  if (!optionsRes.ok) {
    const data = await optionsRes.json().catch(() => ({}));
    if (data?.error?.code === "no_passkeys") {
      return { ok: false, error: "no_passkeys" };
    }
    return { ok: false, error: "No se pudo iniciar la verificación. Inténtalo de nuevo." };
  }
  const optionsJSON = await optionsRes.json();

  let response;
  try {
    response = await withCeremonyTimeout(startAuthentication({ optionsJSON }));
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }

  let verifyRes: Response;
  try {
    verifyRes = await fetchWithTimeout("/api/admin/2fa/webauthn/auth-verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ response }),
    });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
  if (!verifyRes.ok) {
    return { ok: false, error: "Código o clave de acceso incorrectos." };
  }
  return { ok: true, data: {} };
}
