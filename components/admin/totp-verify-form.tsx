"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticateWithPasskey,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@/lib/auth/webauthn-client";

/** Post-login (or step-up) admin strong-auth challenge (SECURITY #53 passkey follow-up). */
export function TotpVerifyForm({
  next = "/admin",
  hasPasskey = false,
}: {
  next?: string;
  hasPasskey?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  /**
   * A PLATFORM authenticator on THIS device (Face ID / Touch ID / Windows
   * Hello / Android screen lock). Without one, `startAuthentication` falls back
   * to a cross-device QR whose hybrid ("caBLE") transport leaves the phone
   * stuck on "conectando…" — so we only LEAD with the passkey when this is
   * available and otherwise lead with the code input, keeping the passkey as a
   * secondary option.
   */
  const [platformPasskey, setPlatformPasskey] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  useEffect(() => {
    const supported = browserSupportsWebAuthn();
    setPasskeySupported(supported);
    if (supported) {
      platformAuthenticatorIsAvailable()
        .then(setPlatformPasskey)
        .catch(() => setPlatformPasskey(false));
    }
  }, []);

  async function afterSuccess() {
    if (trustDevice) {
      try {
        await fetch("/api/admin/2fa/trust-device", { method: "POST" });
      } catch {
        // best-effort — a failed trust grant never blocks a successful login
      }
    }
    router.push(next);
    router.refresh();
  }

  async function submitPasskey() {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    setPasskeyError(null);
    const result = await authenticateWithPasskey();
    setPasskeyBusy(false);
    if (!result.ok) {
      setPasskeyError(
        result.error === "no_passkeys"
          ? "No tienes ninguna clave de acceso configurada en este dispositivo."
          : result.error,
      );
      return;
    }
    await afterSuccess();
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Código incorrecto.");
        setBusy(false);
        return;
      }
      await afterSuccess();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  // Show the passkey button at all only if one is registered and the browser
  // supports WebAuthn; LEAD with it only when this device has a local
  // (platform) authenticator — otherwise it forces the cross-device QR trap.
  const passkeyOffer = hasPasskey && passkeySupported;
  const passkeyLead = passkeyOffer && platformPasskey;

  return (
    <div>
      <h1 className="text-2xl font-bold">Verificación en dos pasos</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {passkeyLead
          ? "Confirma tu identidad con Face ID, Touch ID o el PIN de tu dispositivo."
          : "Introduce el código de tu app de autenticación, o uno de tus códigos de recuperación."}
      </p>

      {passkeyLead && (
        <>
          <button
            type="button"
            data-testid="passkey-verify-start"
            onClick={submitPasskey}
            disabled={passkeyBusy}
            className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          >
            {passkeyBusy
              ? "Confirma en tu dispositivo…"
              : "Continuar con Face ID / clave de acceso"}
          </button>
          {passkeyError && (
            <p
              role="alert"
              data-testid="passkey-verify-error"
              className="mt-2 text-sm text-[var(--color-danger)]"
            >
              {passkeyError}
            </p>
          )}
          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            o usa tu código de autenticación
          </p>
        </>
      )}

      <form onSubmit={submitCode} className={passkeyLead ? "mt-2" : "mt-6"}>
        <label htmlFor="totp-code" className="block text-sm font-medium">
          Código
        </label>
        <input
          id="totp-code"
          data-testid="totp-verify-input"
          inputMode="text"
          autoComplete="one-time-code"
          autoFocus={!passkeyLead}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 block min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-center text-lg tracking-[0.2em]"
        />
        {error && (
          <p
            role="alert"
            data-testid="totp-verify-error"
            className="mt-2 text-sm text-[var(--color-danger)]"
          >
            {error}
          </p>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            data-testid="trust-device-checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="h-5 w-5"
          />
          Confiar en este dispositivo durante 30 días
        </label>

        <button
          type="submit"
          disabled={busy || code.length < 6}
          data-testid="totp-verify-submit"
          className={
            passkeyLead
              ? "mt-4 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium text-[var(--color-text)] disabled:opacity-55"
              : "mt-4 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          }
        >
          {busy ? "Comprobando…" : "Verificar"}
        </button>
      </form>

      {passkeyOffer && !passkeyLead && (
        <>
          <button
            type="button"
            data-testid="passkey-verify-start"
            onClick={submitPasskey}
            disabled={passkeyBusy}
            className="mt-3 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium text-[var(--color-text)] disabled:opacity-55"
          >
            {passkeyBusy ? "Confirma en tu dispositivo…" : "Usar una clave de acceso"}
          </button>
          {passkeyError && (
            <p
              role="alert"
              data-testid="passkey-verify-error"
              className="mt-2 text-sm text-[var(--color-danger)]"
            >
              {passkeyError}
            </p>
          )}
        </>
      )}
    </div>
  );
}
