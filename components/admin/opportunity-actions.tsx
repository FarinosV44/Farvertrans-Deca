"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OPPORTUNITY_STATES,
  OPPORTUNITY_STATE_LABEL,
  ACTIVITY_CHANNELS,
  ACTIVITY_CHANNEL_LABEL,
  type OpportunityState,
  type ActivityChannel,
} from "@/lib/commercial/opportunity-model";

type Outcome = {
  internalRef: string;
  firstPorteDate: string;
  loadsGenerated: string;
  revenueEur: string;
  marginEur: string;
};

/**
 * Per-row commercial actions on the `Oportunidades` radar (#87 / #89): change
 * the follow-up state (logged on the activity trail with the channel used),
 * keep an internal note, open WhatsApp / email — ONLY through the channel + value
 * the carrier authorised — and, for a conversion, record an optional manual
 * economic outcome. Nothing is sent automatically.
 */
export function OpportunityActions({
  companyId,
  companyName,
  state,
  note,
  channel,
  contactEmail,
  contactPhone,
  outcome,
}: {
  companyId: string;
  companyName: string;
  state: OpportunityState;
  note: string | null;
  channel: "email" | "phone" | "both" | null;
  contactEmail: string | null;
  contactPhone: string | null;
  outcome?: Partial<Outcome>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note ?? "");
  const [actChannel, setActChannel] = useState<ActivityChannel>("none");
  const [copied, setCopied] = useState(false);
  const [oc, setOc] = useState<Outcome>({
    internalRef: outcome?.internalRef ?? "",
    firstPorteDate: outcome?.firstPorteDate ?? "",
    loadsGenerated: outcome?.loadsGenerated ?? "",
    revenueEur: outcome?.revenueEur ?? "",
    marginEur: outcome?.marginEur ?? "",
  });

  const phoneAllowed = (channel === "phone" || channel === "both") && !!contactPhone;
  const emailAllowed = (channel === "email" || channel === "both") && !!contactEmail;
  const isConversion = state === "first_load_awarded" || state === "converted";

  const waDigits = (contactPhone ?? "").replace(/[^\d]/g, "");
  const waText = encodeURIComponent(
    `Hola, te escribo de Farvertrans. Hemos visto que ${companyName} podría tener disponibilidad de transporte. ¿Podríamos hablar de posibles cargas?`,
  );
  const waHref = phoneAllowed ? `https://wa.me/${waDigits}?text=${waText}` : null;

  type Payload = {
    state?: OpportunityState;
    note?: string;
    channel?: ActivityChannel;
    outcome?: Record<string, string | number>;
  };

  async function patch(payload: Payload) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/oportunidades/${companyId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channel: actChannel, ...payload }),
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

  function saveOutcome() {
    const num = (s: string) => (s.trim() === "" ? undefined : Number(s));
    patch({
      outcome: {
        internalRef: oc.internalRef.trim(),
        firstPorteDate: oc.firstPorteDate.trim(),
        ...(num(oc.loadsGenerated) !== undefined
          ? { loadsGenerated: num(oc.loadsGenerated)! }
          : {}),
        ...(num(oc.revenueEur) !== undefined ? { revenueEur: num(oc.revenueEur)! } : {}),
        ...(num(oc.marginEur) !== undefined ? { marginEur: num(oc.marginEur)! } : {}),
      },
    });
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

  const inputCls =
    "min-h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-xs";

  return (
    <div className="space-y-1.5">
      <select
        data-testid={`opp-state-${companyId}`}
        value={state}
        disabled={busy}
        onChange={(e) => patch({ state: e.target.value as OpportunityState })}
        className={inputCls}
        aria-label={`Estado comercial de ${companyName}`}
      >
        {OPPORTUNITY_STATES.map((s) => (
          <option key={s} value={s}>
            {OPPORTUNITY_STATE_LABEL[s]}
          </option>
        ))}
      </select>

      <select
        data-testid={`opp-channel-${companyId}`}
        value={actChannel}
        onChange={(e) => setActChannel(e.target.value as ActivityChannel)}
        className={inputCls}
        aria-label={`Canal usado con ${companyName}`}
      >
        {ACTIVITY_CHANNELS.map((c) => (
          <option key={c} value={c}>
            Canal: {ACTIVITY_CHANNEL_LABEL[c]}
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
          onClick={() => setShowNote((x) => !x)}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5"
        >
          {note ? "Nota ✓" : "Nota"}
        </button>
        {isConversion && (
          <button
            type="button"
            data-testid={`opp-outcome-toggle-${companyId}`}
            onClick={() => setShowOutcome((x) => !x)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5"
          >
            Resultado €
          </button>
        )}
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

      {showOutcome && (
        <div className="space-y-1" data-testid={`opp-outcome-${companyId}`}>
          <input
            placeholder="Referencia interna Farvertrans"
            value={oc.internalRef}
            onChange={(e) => setOc((s) => ({ ...s, internalRef: e.target.value }))}
            className={inputCls}
          />
          <input
            type="date"
            aria-label="Fecha del primer porte"
            value={oc.firstPorteDate}
            onChange={(e) => setOc((s) => ({ ...s, firstPorteDate: e.target.value }))}
            className={inputCls}
          />
          <div className="grid grid-cols-3 gap-1">
            <input
              inputMode="numeric"
              placeholder="Cargas"
              value={oc.loadsGenerated}
              onChange={(e) => setOc((s) => ({ ...s, loadsGenerated: e.target.value }))}
              className={inputCls}
            />
            <input
              inputMode="numeric"
              placeholder="Factura €"
              value={oc.revenueEur}
              onChange={(e) => setOc((s) => ({ ...s, revenueEur: e.target.value }))}
              className={inputCls}
            />
            <input
              inputMode="numeric"
              placeholder="Margen €"
              value={oc.marginEur}
              onChange={(e) => setOc((s) => ({ ...s, marginEur: e.target.value }))}
              className={inputCls}
            />
          </div>
          <button
            type="button"
            data-testid={`opp-outcome-save-${companyId}`}
            disabled={busy}
            onClick={saveOutcome}
            className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          >
            Guardar resultado
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
