"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";

type Values = {
  name: string;
  nif: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
};

const LABELS: Record<keyof Values, string> = {
  name: "Nombre / razón social",
  nif: "CIF / NIF",
  contactName: "Persona de contacto",
  phone: "Teléfono",
  email: "Correo electrónico",
  address: "Dirección",
  postalCode: "Código postal",
  city: "Población",
};
const ORDER: (keyof Values)[] = [
  "name",
  "nif",
  "contactName",
  "phone",
  "email",
  "address",
  "postalCode",
  "city",
];

/**
 * Superadmin company-ficha editor (#62). The superadmin is the only actor that
 * may correct `name`/`nif` — those are locked for the company's own users. Sends
 * `action: "edit"` to `PATCH /api/admin/empresas/[id]`, which validates the
 * whole ficha against `companyDataSchema` (a bad CIF/NIF → 422). Step-up gated:
 * a `step_up_required` response links to re-verification instead of failing
 * silently.
 */
export function CompanyEditForm({ id, initial }: { id: string; initial: Partial<Values> }) {
  const router = useRouter();
  const [v, setV] = useState<Values>({
    name: initial.name ?? "",
    nif: initial.nif ?? "",
    contactName: initial.contactName ?? "",
    phone: initial.phone ?? "",
    email: initial.email ?? "",
    address: initial.address ?? "",
    postalCode: initial.postalCode ?? "",
    city: initial.city ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUp, setStepUp] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStepUp(false);
    setDone(false);
    try {
      const res = await fetch(`/api/admin/empresas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "edit", data: v }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        router.refresh();
        return;
      }
      if (data?.error?.code === "step_up_required") {
        setStepUp(true);
        return;
      }
      setError(data?.error?.message ?? "No se pudo guardar la ficha.");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <summary className="cursor-pointer text-sm font-bold">Editar ficha de la empresa</summary>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        El nombre y el CIF/NIF solo puede corregirlos la superadministración. El CIF/NIF debe ser
        válido.
      </p>

      {stepUp && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">
          Verifica tu identidad de nuevo para esta acción.{" "}
          <Link href="/admin/2fa/verify" className="underline">
            Verificar
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-sm text-[var(--color-success)]">
          Ficha actualizada.
        </p>
      )}

      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
        {ORDER.map((k) => (
          <label key={k} className="block text-sm">
            <span className="font-medium">{LABELS[k]}</span>
            <input
              value={v[k]}
              onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))}
              data-testid={`company-edit-${k}`}
              type={k === "email" ? "email" : "text"}
              inputMode={k === "postalCode" || k === "phone" ? "numeric" : undefined}
              className="mt-1 block min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-base"
            />
          </label>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" tier="primary" disabled={busy} data-testid="company-edit-save">
            Guardar ficha
          </Button>
        </div>
      </form>
    </details>
  );
}
