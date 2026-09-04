"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { track } from "@/lib/analytics/client";
import { lockAttribution } from "@/lib/attribution/client";
import { LEGAL_ENTITY } from "@/lib/legal-entity";

const PROFILES = [
  {
    value: "carrier_goods",
    icon: "🚚",
    title: "Transportista de mercancías",
    body: "Realizas el transporte de mercancías por cuenta ajena.",
  },
  {
    value: "shipper",
    icon: "📦",
    title: "Empresa cargadora",
    body: "Contratas transporte para tus propios envíos de mercancías.",
  },
  {
    value: "operator",
    icon: "🔗",
    title: "Operador de transporte",
    body: "Organizas transportes de mercancías (operador logístico o agencia).",
  },
  {
    value: "carrier_passengers",
    icon: "🚌",
    title: "Transportista de viajeros",
    body: "Realizas transporte de viajeros por carretera.",
  },
] as const;

/**
 * The second step of Google sign-up (AUTH #30): the account already exists
 * (Google verified the email) but has no company yet. A team invite skips
 * every company field — same rule as the email/password path.
 */
export function CompleteCompanyForm({
  inviteCompany = null,
  invite,
}: {
  inviteCompany?: string | null;
  invite?: string;
}) {
  const router = useRouter();
  const joiningTeam = !!invite;

  const [f, setF] = useState({
    companyName: "",
    companyNif: "",
    companyAddress: "",
    companyContactName: "",
    companyPhone: "",
    companyProfile: "" as "" | (typeof PROFILES)[number]["value"],
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!joiningTeam && !acceptTerms) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/complete-company", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: f.companyName,
          companyNif: f.companyNif,
          companyAddress: f.companyAddress,
          companyContactName: f.companyContactName,
          companyPhone: f.companyPhone,
          companyProfile: f.companyProfile || undefined,
          acceptTerms,
          invite,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudo completar. Inténtalo de nuevo.");
        setBusy(false);
        return;
      }
      track("signup_completed");
      if (!data?.joinedTeam) track("company_created");
      if (f.companyProfile) track("company_profile_selected");
      lockAttribution();
      router.push("/panel");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {joiningTeam ? "Únete al equipo" : "Ya casi está"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {joiningTeam
          ? `${inviteCompany ? `${inviteCompany} te ha invitado. ` : ""}Confirma tu acceso y compartirás sus DeCA y datos habituales.`
          : "Solo necesitamos los datos de tu empresa para empezar a emitir DeCA."}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        {!joiningTeam && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">Tu empresa</legend>
            <Field
              id="companyName"
              label="Nombre o razón social"
              autoComplete="organization"
              value={f.companyName}
              onChange={set("companyName")}
            />
            <Field
              id="companyNif"
              label="CIF / NIF"
              value={f.companyNif}
              onChange={set("companyNif")}
            />
            <Field
              id="companyContactName"
              label="Persona de contacto (opcional)"
              required={false}
              autoComplete="name"
              value={f.companyContactName}
              onChange={set("companyContactName")}
            />
            <Field
              id="companyPhone"
              label="Teléfono (opcional)"
              type="tel"
              required={false}
              autoComplete="tel"
              value={f.companyPhone}
              onChange={set("companyPhone")}
            />
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

        {!joiningTeam && (
          <fieldset className="mt-4">
            <legend className="px-1 text-sm font-bold">
              ¿Cómo utilizarás principalmente la plataforma? <span aria-hidden>*</span>
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
              {PROFILES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={f.companyProfile === p.value}
                  data-testid={`profile-${p.value}`}
                  onClick={() => setF((s) => ({ ...s, companyProfile: p.value }))}
                  className={`flex min-h-24 flex-col items-start gap-1 rounded-[var(--radius-md)] border p-4 text-left ${
                    f.companyProfile === p.value
                      ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <span aria-hidden className="text-2xl">
                    {p.icon}
                  </span>
                  <span className="text-sm font-bold">{p.title}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{p.body}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {!joiningTeam && (
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              data-testid="accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              He leído la{" "}
              <Link href={LEGAL_ENTITY.privacyUrl} className="underline">
                Política de Privacidad
              </Link>{" "}
              y acepto los{" "}
              <Link href={LEGAL_ENTITY.termsUrl} className="underline">
                Términos y Condiciones
              </Link>
              .
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="complete-company-submit"
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-55"
        >
          {busy ? "Un momento…" : "Continuar"}
        </button>
      </form>
    </div>
  );
}
