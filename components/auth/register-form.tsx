"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { PasswordField } from "@/components/auth/password-field";
import { GoogleButton } from "@/components/auth/google-button";
import { track } from "@/lib/analytics/client";
import { lockAttribution } from "@/lib/attribution/client";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

export function RegisterForm({
  initialMode = "register",
  inviteCompany = null,
  inviteEmail = null,
  prospectCompany = null,
  googleEnabled = false,
}: {
  initialMode?: "register" | "login";
  inviteCompany?: string | null;
  inviteEmail?: string | null;
  prospectCompany?: { name: string; nif: string } | null;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const claim = params.get("claim") ?? undefined;
  const invite = params.get("invite") ?? undefined;
  const nextPath = safeInternalPath(params.get("next"));
  // A team invite joins an existing workspace (no company fields); a prospect
  // onboarding link still creates a company (fields shown, prefilled — GROWTH #28).
  const joiningTeam = !!invite && !prospectCompany;

  const [f, setF] = useState({
    email: inviteEmail ?? "",
    password: "",
    companyName: prospectCompany?.name ?? "",
    companyNif: prospectCompany?.nif ?? "",
    companyAddress: "",
  });
  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    if (mode === "register") track("signup_started");
    const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register"
        ? { ...f, claim, invite }
        : { email: f.email, password: f.password, claim, invite };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudo completar. Inténtalo de nuevo.");
        setBusy(false);
        return;
      }
      if (mode === "register") {
        track("signup_completed");
        if (!data?.joinedTeam) track("company_created");
        lockAttribution(); // first-touch is now permanent
        if (data?.claimedDecaId) track("anonymous_deca_claimed");
      } else {
        track("login_completed");
      }
      if (claim) track("claim_completed");
      router.push(nextPath);
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  const heading = joiningTeam
    ? "Únete al equipo"
    : claim
      ? "Guarda este DeCA"
      : mode === "register"
        ? "Crea tu cuenta gratis"
        : "Bienvenido de nuevo";

  const subhead = joiningTeam
    ? `${inviteCompany ? `${inviteCompany} te ha invitado. ` : ""}Crea tu acceso y compartirás sus DeCA y datos habituales. No hace falta dar de alta otra empresa.`
    : claim
      ? "Crea una cuenta gratuita para guardar este documento y reutilizar tus datos. No es un formulario comercial."
      : mode === "register"
        ? "Guarda tus DeCA, reutiliza tus datos habituales y genera documentos nuevos más rápido."
        : "Entra para ver tus DeCA, reutilizar tus datos y generar nuevos documentos más rápido.";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]" data-testid="register-subhead">
        {subhead}
      </p>

      <div className="mt-6">
        <GoogleButton enabled={googleEnabled} label="Continuar con Google" />
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">o continúa con email</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
        />
        <PasswordField
          value={f.password}
          onChange={set("password")}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          hint={mode === "register" ? "Al menos 8 caracteres." : undefined}
        />
        {mode === "register" && !joiningTeam && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">Tu empresa</legend>
            <Field
              id="companyName"
              label="Nombre o razón social"
              autoComplete="organization"
              value={f.companyName}
              onChange={set("companyName")}
            />
            <Field id="companyNif" label="NIF" value={f.companyNif} onChange={set("companyNif")} />
            <Field
              id="companyAddress"
              label="Domicilio (opcional)"
              required={false}
              autoComplete="street-address"
              value={f.companyAddress}
              onChange={set("companyAddress")}
            />
          </fieldset>
        )}
        <button
          type="submit"
          disabled={busy}
          data-testid="register-submit"
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-55"
        >
          {busy ? "Un momento…" : mode === "register" ? "Crear cuenta gratis" : "Entrar"}
        </button>
      </form>

      {mode === "login" && (
        <p className="mt-3 text-sm">
          <Link href="/recuperar" data-testid="forgot-password">
            ¿Has olvidado tu contraseña?
          </Link>
        </p>
      )}

      <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-muted)]">
        {mode === "register" ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
        <button
          type="button"
          data-testid="auth-mode-toggle"
          onClick={() => {
            setMode((m) => (m === "register" ? "login" : "register"));
            setError(null);
          }}
          className="font-medium text-[var(--color-primary)] underline"
        >
          {mode === "register" ? "Inicia sesión" : "Crea tu cuenta gratis"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        Gratis · Sin tarjeta · Tus DeCA en un solo lugar
      </p>
    </div>
  );
}
