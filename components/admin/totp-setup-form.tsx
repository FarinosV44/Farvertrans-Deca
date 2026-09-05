"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Mandatory admin TOTP enrollment (SECURITY #53): QR + manual-secret
 * fallback, one confirmed code before anything is considered enabled, then
 * the one-time recovery codes. Google/Microsoft Authenticator and Authy all
 * scan the same standard `otpauth://` QR — no app-specific branching needed.
 */
export function TotpSetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState("");
  const [qrDataUri, setQrDataUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/2fa/enroll", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setSecret(data.secret);
          setQrDataUri(data.qrDataUri);
        } else if (data?.error?.code === "already_enrolled") {
          router.push("/admin");
        } else {
          setError("No se pudo iniciar la configuración. Recarga la página.");
        }
      } catch {
        setError("Sin conexión. Recarga la página.");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm(e: React.FormEvent) {
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
      setRecoveryCodes(data.recoveryCodes);
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
          seguro — los necesitarás si pierdes acceso a tu app de autenticación.
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
          onClick={() => {
            router.push("/admin");
            router.refresh();
          }}
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)]"
        >
          Ya los he guardado — continuar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Configura la verificación en dos pasos</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Obligatoria para acceder al panel de administración. Escanea este código con Google
        Authenticator, Microsoft Authenticator, Authy o cualquier app TOTP compatible.
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

          <form onSubmit={confirm} className="mt-6">
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
