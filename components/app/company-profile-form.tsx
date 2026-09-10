"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export type CompanyContact = {
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  contactName: string | null;
};

/** Edit the company's contact profile (email/phone/address/contact name) — owner-only. */
export function CompanyProfileForm({
  initial,
  canChange,
}: {
  initial: CompanyContact;
  canChange: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    postalCode: initial.postalCode ?? "",
    city: initial.city ?? "",
    contactName: initial.contactName ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => {
    setF((s) => ({ ...s, [k]: v }));
    setSaved(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudieron guardar los datos.");
        setBusy(false);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  }

  if (!canChange) {
    // One column on phones. NOTE: this theme's `sm` breakpoint is 360px, so
    // `sm:grid-cols-2` would still be two columns on every phone and long
    // values (e.g. the contact email) overlap the next field — the fields
    // go two-up only from `md` (768px). `min-w-0` + `break-words` on each
    // Field keeps a long value inside its own cell.
    return (
      <dl className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-2">
        <Field label="Email de contacto" value={initial.email} />
        <Field label="Teléfono" value={initial.phone} />
        <Field label="Dirección" value={initial.address} />
        <Field label="Código postal" value={initial.postalCode} />
        <Field label="Población" value={initial.city} />
        <Field label="Persona de contacto" value={initial.contactName} />
      </dl>
    );
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={(e) => void submit(e)}>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block min-w-0 text-sm">
          <span className="font-medium">Email de contacto</span>
          <input
            type="email"
            data-testid="company-email"
            value={f.email}
            onChange={(e) => set("email")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block min-w-0 text-sm">
          <span className="font-medium">Teléfono</span>
          <input
            type="tel"
            data-testid="company-phone"
            value={f.phone}
            onChange={(e) => set("phone")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block min-w-0 text-sm md:col-span-2">
          <span className="font-medium">Dirección</span>
          <input
            type="text"
            data-testid="company-address"
            value={f.address}
            onChange={(e) => set("address")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block min-w-0 text-sm">
          <span className="font-medium">Código postal</span>
          <input
            type="text"
            inputMode="numeric"
            data-testid="company-postal-code"
            value={f.postalCode}
            onChange={(e) => set("postalCode")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block min-w-0 text-sm">
          <span className="font-medium">Población</span>
          <input
            type="text"
            data-testid="company-city"
            value={f.city}
            onChange={(e) => set("city")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block min-w-0 text-sm md:col-span-2">
          <span className="font-medium">Persona de contacto</span>
          <input
            type="text"
            data-testid="company-contact-name"
            value={f.contactName}
            onChange={(e) => set("contactName")(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" tier="primary" data-testid="company-profile-save" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
        {saved && (
          <span role="status" className="text-sm font-semibold text-[var(--color-success)]">
            Guardado.
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm break-words [overflow-wrap:anywhere]">{value ?? "—"}</dd>
    </div>
  );
}
