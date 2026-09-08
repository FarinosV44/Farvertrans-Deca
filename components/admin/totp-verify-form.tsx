"use client";
import { useEffect, useState } from "react";
import {
  authenticateWithPasskey,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@/lib/auth/webauthn-client";

/** Post-login (or step-up) admin strong-auth challenge (SECURITY #53 passkey follow-up). */
export function TotpVerifyForm({
  next = "/admin",
  hasPasskey = false,
  hasTotp = true,
}: {
  next?: string;
  hasPasskey?: boolean;
  /** When the admin also has an authenticator app, the code input leads and the
   * passkey is a secondary option — never the reverse, because on a desktop PC
   * `platformAuthenticatorIsAvailable()` reports true for Windows Hello even
   * when the registered passkey lives on another device, and leading with it
   * there sends the user into the cross-device "conectando…" trap (#86 part 7). */
  hasTotp?: boolean;
}) {
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
  // #91 — backup-password path (only replaces the Super Admin verification step).
  const [showBackup, setShowBackup] = useState(false);
  const [backupPw, setBackupPw] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);

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
    // Hard navigation, NOT router.push + refresh: the App Router can serve a
    // prefetched-then-cached redirect for `/admin` that was captured with the
    // pre-verification cookie, bouncing the user straight back to this screen.
    // A full document load always carries the fresh session cookie (#86 part 7).
    window.location.assign(next);
  }

  async function submitPasskey() {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    setPasskeyError(null);
    let result: Awaited<ReturnType<typeof authenticateWithPasskey>>;
    try {
      result = await authenticateWithPasskey();
    } catch (e) {
      // authenticateWithPasskey never throws by contract, but a `finally` that
      // clears the loading state is the whole point of #91 — belt and braces.
      result = { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
    } finally {
      setPasskeyBusy(false);
    }
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

  async function submitBackup(e: React.FormEvent) {
    e.preventDefault();
    if (backupBusy || !backupPw) return;
    setBackupBusy(true);
    setBackupError(null);
    try {
      const res = await fetch("/api/admin/2fa/backup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: backupPw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBackupError(data?.error?.message ?? "No se pudo verificar. Inténtalo de nuevo.");
        return;
      }
      setBackupPw("");
      await afterSuccess();
    } catch {
      setBackupError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBackupBusy(false);
    }
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
  // Lead with the passkey ONLY for a passkey-only admin on a device with a
  // local authenticator. With an authenticator app enrolled, the code always
  // leads (see `hasTotp` above).
  const passkeyLead = passkeyOffer && platformPasskey && !hasTotp;

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

      {/* #91 — offline recovery for the Super Admin verification step only. */}
      <div className="mt-6 border-t border-[var(--color-border)] pt-4">
        {!showBackup ? (
          <button
            type="button"
            data-testid="use-backup-password"
            onClick={() => {
              setShowBackup(true);
              setBackupError(null);
            }}
            className="text-sm font-medium text-[var(--color-primary)]"
          >
            Usar contraseña de emergencia
          </button>
        ) : (
          <form onSubmit={submitBackup}>
            <label htmlFor="backup-password" className="block text-sm font-medium">
              Contraseña de emergencia
            </label>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Solo sustituye la verificación adicional del panel de administración, nunca tu acceso
              normal a la aplicación.
            </p>
            <input
              id="backup-password"
              data-testid="backup-password-input"
              type="password"
              autoComplete="off"
              value={backupPw}
              onChange={(e) => setBackupPw(e.target.value)}
              className="mt-2 block min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
            {backupError && (
              <p
                role="alert"
                data-testid="backup-password-error"
                className="mt-2 text-sm text-[var(--color-danger)]"
              >
                {backupError}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                data-testid="backup-password-submit"
                disabled={backupBusy || !backupPw}
                className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
              >
                {backupBusy ? "Comprobando…" : "Acceder"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBackup(false);
                  setBackupPw("");
                  setBackupError(null);
                }}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
