"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OPPORTUNITY_STATES,
  OPPORTUNITY_STATE_LABEL,
  type OpportunityState,
} from "@/lib/commercial/opportunity-model";

/**
 * Per-row commercial actions on the `Oportunidades` radar (#87): change the
 * follow-up state, keep an internal note, and open WhatsApp / email — but ONLY
 * through the channel + value the carrier authorised (`CommercialConsent`).
 * Nothing is sent automatically.
 */
export function OpportunityActions({
  companyId,
  companyName,
  state,
  note,
  channel,
  contactEmail,
  contactPhone,
}: {
  companyId: string;
  companyName: string;
  state: OpportunityState;
  note: string | null;
  channel: "email" | "phone" | "both" | null;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note ?? "");
  const [copied, setCopied] = useState(false);

  const phoneAllowed = (channel === "phone" || channel === "both") && !!contactPhone;
  const emailAllowed = (channel === "email" || channel === "both") && !!contactEmail;

  const waDigits = (contactPhone ?? "").replace(/[^\d]/g, "");
  const waText = encodeURIComponent(
    `Hola, te escribo de Farvertrans. Hemos visto que ${companyName} podría tener disponibilidad de transporte. ¿Podríamos hablar de posibles cargas?`,
  );
  const waHref = phoneAllowed ? `https://wa.me/${waDigits}?text=${waText}` : null;

  async function patch(payload: { state?: OpportunityState; note?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/oportunidades/${companyId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(res.status === 409 ? "La empresa ya no es elegible." : "No se pudo guardar.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
  }

  async function copyEmail() {
    if (!contactEmail) return;
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the address is visible to select manually */
    }
  }

  return (
    <div className="space-y-1.5">
      <select
        data-testid={`opp-state-${companyId}`}
        value={state}
        disabled={busy}
        onChange={(e) => patch({ state: e.target.value as OpportunityState })}
        className="min-h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-xs"
        aria-label={`Estado comercial de ${companyName}`}
      >
        {OPPORTUNITY_STATES.map((s) => (
          <option key={s} value={s}>
            {OPPORTUNITY_STATE_LABEL[s]}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {waHref && (
          <a
            data-testid={`opp-whatsapp-${companyId}`}
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5 no-underline"
          >
            WhatsApp
          </a>
        )}
        {emailAllowed && (
          <button
            type="button"
            data-testid={`opp-email-${companyId}`}
            onClick={copyEmail}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5"
          >
            {copied ? "Copiado" : "Copiar email"}
          </button>
        )}
        <a
          href={`/admin/empresas/${companyId}`}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5 no-underline"
        >
          Ficha
        </a>
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5"
        >
          {note ? "Nota ✓" : "Nota"}
        </button>
      </div>

      {!phoneAllowed && !emailAllowed && (
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Sin canal de contacto autorizado.
        </p>
      )}

      {showNote && (
        <div className="space-y-1">
          <textarea
            data-testid={`opp-note-${companyId}`}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={2}
            maxLength={2000}
            className="block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-1 text-xs"
          />
          <button
            type="button"
            data-testid={`opp-note-save-${companyId}`}
            disabled={busy}
            onClick={() => patch({ note: noteDraft })}
            className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          >
            Guardar nota
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
