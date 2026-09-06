"use client";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";

/**
 * Client-side passkey helpers shared by the setup screen, the verify
 * screen, and the Security settings screen — one place that talks to
 * `navigator.credentials` via `@simplewebauthn/browser`, so every caller
 * gets the same friendly error mapping (SECURITY #53 passkey follow-up,
 * brief item 9: "clear success/error messages").
 */

export { browserSupportsWebAuthn };

function friendlyError(e: unknown): string {
  const name = e instanceof Error ? e.name : "";
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
  const optionsRes = await fetch("/api/admin/2fa/webauthn/register-options", { method: "POST" });
  if (!optionsRes.ok) {
    return { ok: false, error: "No se pudo iniciar el registro. Inténtalo de nuevo." };
  }
  const optionsJSON = await optionsRes.json();

  let response;
  try {
    response = await startRegistration({ optionsJSON });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }

  const verifyRes = await fetch("/api/admin/2fa/webauthn/register-verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ response, name }),
  });
  const data = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok) {
    return { ok: false, error: "No se pudo guardar la clave de acceso. Inténtalo de nuevo." };
  }
  return { ok: true, data: { recoveryCodes: data.recoveryCodes } };
}

/** Authenticate with an already-registered passkey (login challenge or step-up). */
export async function authenticateWithPasskey(): Promise<PasskeyResult<Record<string, never>>> {
  const optionsRes = await fetch("/api/admin/2fa/webauthn/auth-options", { method: "POST" });
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
    response = await startAuthentication({ optionsJSON });
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }

  const verifyRes = await fetch("/api/admin/2fa/webauthn/auth-verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ response }),
  });
  if (!verifyRes.ok) {
    return { ok: false, error: "Código o clave de acceso incorrectos." };
  }
  return { ok: true, data: {} };
}
