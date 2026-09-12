"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NEEDS } from "@/lib/integrations/constants";
import { useT } from "@/lib/i18n/client";

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
  // D-246 fix: `t.done` is a function, so it must be read via `useT()` here
  // rather than passed as a prop from the Server Component that renders this
  // — functions cannot cross the RSC server→client boundary.
  const t = useT().panel.integrations;
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
      else setError(data?.error?.message ?? t.submitError);
    } catch {
      setError(t.offlineError);
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
        {t.done(companyName)}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="integration-form">
      <p className="text-sm text-[var(--color-text-muted)]">{t.formIntro}</p>
      <label className="block text-sm">
        <span className="font-medium">{t.systemLabel}</span>
        <input
          value={f.system}
          onChange={(e) => setF((s) => ({ ...s, system: e.target.value }))}
          required
          data-testid="integration-system"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">{t.needLabel}</span>
        <select
          value={f.need}
          onChange={(e) => setF((s) => ({ ...s, need: e.target.value as (typeof NEEDS)[number] }))}
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
        >
          {NEEDS.map((n) => (
            <option key={n} value={n}>
              {t.needOptions[n]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">{t.contactLabel}</span>
          <input
            value={f.contactName}
            onChange={(e) => setF((s) => ({ ...s, contactName: e.target.value }))}
            className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t.contactEmailLabel}</span>
          <input
            type="email"
            value={f.contactEmail}
            onChange={(e) => setF((s) => ({ ...s, contactEmail: e.target.value }))}
            className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium">{t.volumeLabel}</span>
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
        {t.submit}
      </button>
      <p className="text-xs text-[var(--color-text-muted)]">{t.footerNote}</p>
    </form>
  );
}
