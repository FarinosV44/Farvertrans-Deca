"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Post-login (or step-up) admin TOTP challenge (SECURITY #53). */
export function TotpVerifyForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
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
      router.push(next);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Verificación en dos pasos</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Introduce el código de tu app de autenticación, o uno de tus códigos de recuperación.
      </p>
      <form onSubmit={submit} className="mt-6">
        <label htmlFor="totp-code" className="block text-sm font-medium">
          Código
        </label>
        <input
          id="totp-code"
          data-testid="totp-verify-input"
          inputMode="text"
          autoComplete="one-time-code"
          autoFocus
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
        <button
          type="submit"
          disabled={busy || code.length < 6}
          data-testid="totp-verify-submit"
          className="mt-4 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {busy ? "Comprobando…" : "Verificar"}
        </button>
      </form>
    </div>
  );
}
