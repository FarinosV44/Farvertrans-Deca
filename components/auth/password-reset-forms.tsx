"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { checkPasswordStrength, PASSWORD_REQUIREMENTS_TEXT } from "@/lib/auth/password-policy";

/** Step 1 — ask for the account email. Always confirms the same way. */
export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | "sent" | "unconfigured" | "unknown">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({ delivery: "unknown" }));
      setDone(data.delivery ?? "unknown");
    } catch {
      setDone("unknown");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Revisa tu correo</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Si hay una cuenta con ese email, te hemos enviado un enlace para restablecer la
          contraseña. Caduca en 1 hora.
        </p>
        {done === "unconfigured" && (
          <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
            El envío de correo todavía no está configurado en este entorno. Contacta con soporte
            para recuperar el acceso.
          </p>
        )}
        <p className="mt-6 text-sm">
          <Link href="/entrar">Volver a entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Recuperar acceso</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Introduce el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
      </p>
      <form onSubmit={submit} className="mt-4" noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <button
          type="submit"
          disabled={busy}
          data-testid="reset-request-submit"
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {busy ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/entrar">Volver a entrar</Link>
      </p>
    </div>
  );
}

/** Step 2 — set a new password from the emailed link. Logs in on success. */
export function SetNewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const strength = checkPasswordStrength(password);
    if (!strength.ok) {
      setError(strength.reason);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudo restablecer la contraseña.");
        setBusy(false);
        return;
      }
      router.push("/panel");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Elige una contraseña nueva. Al guardarla entrarás directamente en tu cuenta.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
          {error}{" "}
          <Link href="/recuperar" className="underline">
            Pedir otro enlace
          </Link>
        </p>
      )}
      <form onSubmit={submit} className="mt-4" noValidate>
        <Field
          id="password"
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          hint={PASSWORD_REQUIREMENTS_TEXT}
          value={password}
          onChange={setPassword}
        />
        <button
          type="submit"
          disabled={busy}
          data-testid="reset-confirm-submit"
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {busy ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}
