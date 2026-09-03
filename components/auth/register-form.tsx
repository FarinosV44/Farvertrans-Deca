"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { track } from "@/lib/analytics/client";
import { lockAttribution } from "@/lib/attribution/client";

export function RegisterForm({ initialMode = "register" }: { initialMode?: "register" | "login" }) {
  const router = useRouter();
  const params = useSearchParams();
  const claim = params.get("claim") ?? undefined;
  const nextPath = params.get("next") ?? "/panel";

  const [f, setF] = useState({
    email: "",
    password: "",
    companyName: "",
    companyNif: "",
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
    track("signup_started");
    const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register" ? { ...f, claim } : { email: f.email, password: f.password, claim };
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
        lockAttribution(); // first-touch is now permanent
      }
      if (claim) track("claim_completed");
      router.push(nextPath.startsWith("/") ? nextPath : "/panel");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">
        {claim ? "Guarda este DeCA" : mode === "register" ? "Crea tu cuenta" : "Inicia sesión"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {claim
          ? "Crea una cuenta gratuita para guardar este documento y reutilizar tus datos. No es un formulario comercial."
          : "Guarda tus DeCA y reutiliza tus datos habituales."}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="mt-4" noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
        />
        <Field
          id="password"
          label="Contraseña"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={f.password}
          onChange={set("password")}
          hint={mode === "register" ? "Al menos 8 caracteres." : undefined}
        />
        {mode === "register" && (
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
          {busy ? "Un momento…" : mode === "register" ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "register" ? "login" : "register"));
          setError(null);
        }}
        className="mt-4 text-sm underline"
      >
        {mode === "register" ? "Ya tengo cuenta" : "Crear una cuenta"}
      </button>
      <p className="mt-6 text-sm">
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
