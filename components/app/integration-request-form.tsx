"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NEEDS, NEED_LABEL } from "@/lib/integrations/constants";

/**
 * #74 — "Solicitar integración". Company + contact autofill from the session;
 * asks only for the system, the main need and (optionally) a rough volume. No
 * technical details, no credentials.
 */
export function IntegrationRequestForm({
  companyName,
  contactName,
  contactEmail,
}: {
  companyName: string;
  contactName?: string;
  contactEmail?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    system: "",
    need: "crear_deca" as (typeof NEEDS)[number],
    contactName: contactName ?? "",
    contactEmail: contactEmail ?? "",
    volumeNote: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/integraciones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(true);
      else setError(data?.error?.message ?? "No se pudo enviar la solicitud.");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  if (done) {
    return (
      <p
        role="status"
        data-testid="integration-done"
        className="rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] p-4 text-sm"
      >
        Solicitud recibida para <strong>{companyName}</strong>. Revisaremos tus necesidades de
        integración y nos pondremos en contacto contigo. Las integraciones son un servicio adicional
        que se presupuesta según el proyecto.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="integration-form">
      <p className="text-sm text-[var(--color-text-muted)]">
        Estamos abriendo integraciones de forma progresiva. Cuéntanos qué sistema utilizas.
      </p>
      <label className="block text-sm">
        <span className="font-medium">Sistema / TMS / ERP</span>
        <input
          value={f.system}
          onChange={(e) => setF((s) => ({ ...s, system: e.target.value }))}
          required
          data-testid="integration-system"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Necesidad principal</span>
        <select
          value={f.need}
          onChange={(e) => setF((s) => ({ ...s, need: e.target.value as (typeof NEEDS)[number] }))}
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
        >
          {NEEDS.map((n) => (
            <option key={n} value={n}>
              {NEED_LABEL[n]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Contacto</span>
          <input
            value={f.contactName}
            onChange={(e) => setF((s) => ({ ...s, contactName: e.target.value }))}
            className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email de contacto</span>
          <input
            type="email"
            value={f.contactEmail}
            onChange={(e) => setF((s) => ({ ...s, contactEmail: e.target.value }))}
            className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Volumen aproximado de DeCA/mes (opcional)</span>
        <input
          value={f.volumeNote}
          onChange={(e) => setF((s) => ({ ...s, volumeNote: e.target.value }))}
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        data-testid="integration-submit"
        className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        Solicitar integración
      </button>
      <p className="text-xs text-[var(--color-text-muted)]">
        No pedimos credenciales ni datos técnicos. Sin compromiso ni fecha de disponibilidad.
      </p>
    </form>
  );
}
