"use client";
import { useEffect, useState } from "react";
import {
  registerPasskey,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@/lib/auth/webauthn-client";

type Mode = "choice" | "totp";

/**
 * Hard navigation to the admin home after enrollment — NOT router.push, which
 * can be served a prefetched-and-cached `/admin` redirect captured before the
 * session had strong-auth, bouncing the admin back to the challenge (#86 p7).
 */
function goToAdmin() {
  window.location.assign("/admin");
}

/**
 * First-time admin strong-auth enrollment (SECURITY #53 passkey follow-up).
 * Passkey (Face ID / Touch ID / Windows Hello) is the primary path — one
 * button, no QR code, no manual secret. TOTP (Google/Microsoft
 * Authenticator, Authy) stays fully available as the explicit fallback for
 * devices/browsers without a platform authenticator. Both paths converge on
 * the same one-time recovery-codes screen.
 */
export function TotpSetupForm() {
  const [mode, setMode] = useState<Mode>("choice");
  const [passkeySupported, setPasskeySupported] = useState(true);
  /**
   * A PLATFORM authenticator (Face ID / Touch ID / Windows Hello / Android
   * screen lock). Only when this is present do we lead with the passkey: on a
   * desktop without one, the browser falls back to a cross-device QR that the
   * phone hangs on "connecting…" for — so there we lead with TOTP instead and
   * keep the passkey as a small secondary option.
   */
  const [platformPasskey, setPlatformPasskey] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrDataUri, setQrDataUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    const supported = browserSupportsWebAuthn();
    setPasskeySupported(supported);
    if (supported) {
      platformAuthenticatorIsAvailable()
        .then(setPlatformPasskey)
        .catch(() => setPlatformPasskey(false));
    }
  }, []);

  useEffect(() => {
    if (mode !== "totp") return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/admin/2fa/enroll", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setSecret(data.secret);
          setQrDataUri(data.qrDataUri);
        } else if (data?.error?.code === "already_enrolled") {
          goToAdmin();
        } else {
          setError("No se pudo iniciar la configuración. Recarga la página.");
        }
      } catch {
        if (!cancelled) setError("Sin conexión. Recarga la página.");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function startPasskey() {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    setPasskeyError(null);
    const result = await registerPasskey();
    setPasskeyBusy(false);
    if (!result.ok) {
      setPasskeyError(result.error);
      return;
    }
    if (result.data.recoveryCodes) {
      setRecoveryCodes(result.data.recoveryCodes);
    } else {
      goToAdmin();
    }
  }

  async function confirmTotp(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/2fa/enable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.error?.code === "invalid_code"
            ? "Código incorrecto. Inténtalo de nuevo."
            : "No se pudo activar la verificación en dos pasos.",
        );
        setBusy(false);
        return;
      }
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes);
      } else {
        goToAdmin();
      }
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  }

  if (recoveryCodes) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Guarda tus códigos de recuperación</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Cada código solo se puede usar una vez, y solo los verás aquí. Guárdalos en un lugar
          seguro — los necesitarás si pierdes acceso a tu clave de acceso o app de autenticación.
        </p>
        <ul
          data-testid="recovery-codes"
          className="mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-sm"
        >
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button
          type="button"
          data-testid="totp-setup-continue"
          onClick={goToAdmin}
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)]"
        >
          Ya los he guardado — continuar
        </button>
      </div>
    );
  }

  if (mode === "choice") {
    // Lead with the passkey only when this device can do it locally. Otherwise
    // the app-of-authentication route is the reliable one (no cross-device QR).
    const passkeyPrimary = passkeySupported && platformPasskey;

    const passkeyButton = (
      <button
        type="button"
        data-testid="setup-passkey-start"
        onClick={startPasskey}
        disabled={passkeyBusy}
        className={
          passkeyPrimary
            ? "mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            : "mt-3 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium text-[var(--color-text)] disabled:opacity-55"
        }
      >
        {passkeyBusy
          ? "Confirma en tu dispositivo…"
          : passkeyPrimary
            ? "Configurar con Face ID / clave de acceso"
            : "Usar una clave de acceso (Face ID, Touch ID, Windows Hello…)"}
      </button>
    );

    const totpButton = (
      <button
        type="button"
        data-testid="setup-use-totp"
        onClick={() => setMode("totp")}
        className={
          passkeyPrimary
            ? "mt-3 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 font-medium text-[var(--color-text)]"
            : "mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)]"
        }
      >
        Usar una app de autenticación (Google Authenticator, Authy…)
      </button>
    );

    return (
      <div>
        <h1 className="text-2xl font-bold">Protege tu cuenta de administrador</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {passkeyPrimary
            ? "Obligatorio para acceder al panel de administración. La forma más rápida es con Face ID, Touch ID, Windows Hello o el PIN de tu dispositivo."
            : "Obligatorio para acceder al panel de administración. En este equipo, lo más fiable es una app de autenticación en el móvil (el código de 6 dígitos)."}
        </p>

        {passkeyPrimary ? (
          <>
            {passkeySupported && passkeyButton}
            {passkeyError && (
              <p
                role="alert"
                data-testid="setup-passkey-error"
                className="mt-2 text-sm text-[var(--color-danger)]"
              >
                {passkeyError}
              </p>
            )}
            {totpButton}
          </>
        ) : (
          <>
            {totpButton}
            {passkeySupported && (
              <>
                {passkeyButton}
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Requiere Face ID / Touch ID / Windows Hello en este equipo, o confirmar en otro
                  dispositivo por Bluetooth.
                </p>
              </>
            )}
            {passkeyError && (
              <p
                role="alert"
                data-testid="setup-passkey-error"
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

  return (
    <div>
      <button
        type="button"
        data-testid="setup-back-to-choice"
        onClick={() => setMode("choice")}
        className="text-sm font-medium text-[var(--color-primary)]"
      >
        ← Volver
      </button>
      <h1 className="mt-2 text-2xl font-bold">Configura la verificación en dos pasos</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Escanea este código con Google Authenticator, Microsoft Authenticator, Authy o cualquier app
        TOTP compatible.
      </p>
      {loading ? (
        <p className="mt-6 text-sm">Cargando…</p>
      ) : (
        <>
          {qrDataUri && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUri}
              alt="Código QR para configurar la verificación en dos pasos"
              className="mt-6 h-48 w-48"
              data-testid="totp-qr"
            />
          )}
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
              ¿No puedes escanear el QR? Introduce la clave manualmente
            </summary>
            <p
              data-testid="totp-manual-secret"
              className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-surface)] p-2 font-mono text-sm break-all"
            >
              {secret}
            </p>
          </details>

          <form onSubmit={confirmTotp} className="mt-6">
            <label htmlFor="totp-code" className="block text-sm font-medium">
              Código de 6 dígitos
            </label>
            <input
              id="totp-code"
              data-testid="totp-code-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1 block min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-center text-lg tracking-[0.3em]"
            />
            {error && (
              <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              data-testid="totp-setup-confirm"
              className="mt-4 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            >
              {busy ? "Comprobando…" : "Activar verificación en dos pasos"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
