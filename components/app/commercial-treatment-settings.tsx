"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { sharedFieldKeys } from "@/lib/commercial/types";
import type {
  CommercialConsentMode,
  CommercialContactChannel,
  CommercialTreatmentState,
} from "@/lib/commercial/types";

/**
 * The "Tratamiento comercial" control (#84). Opt-in, three modes, revocable,
 * with an exact preview of what would be shared. Owner-only editable; members
 * see the current state read-only. No pre-checked options, no alarm colours —
 * the "no autorizado" state is normal and neutral.
 */
export function CommercialTreatmentSettings({
  treatment,
  companyEmail,
  companyPhone,
  canChange,
}: {
  treatment: CommercialTreatmentState;
  companyEmail: string | null;
  companyPhone: string | null;
  canChange: boolean;
}) {
  const t = useT();
  const p = t.panel.privacy;
  const router = useRouter();

  const [mode, setMode] = useState<CommercialConsentMode>(treatment.mode);
  const [channel, setChannel] = useState<CommercialContactChannel>(treatment.channel ?? "email");
  const [email, setEmail] = useState(treatment.contactEmail ?? companyEmail ?? "");
  const [phone, setPhone] = useState(treatment.contactPhone ?? companyPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/company/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(p.error);
        setBusy(false);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(p.error);
    }
    setBusy(false);
  }

  const chooseMode = (m: CommercialConsentMode) => {
    setMode(m);
    void post({ mode: m });
  };

  const modeOptions: { value: CommercialConsentMode; label: string; hint: string }[] = [
    { value: "none", label: p.modes.none, hint: p.modes.noneHint },
    { value: "per_deca", label: p.modes.perDeca, hint: p.modes.perDecaHint },
    { value: "all", label: p.modes.all, hint: p.modes.allHint },
  ];

  const previewLabels: Record<string, string> = {
    carrierName: p.previewFields.carrierName,
    destination: p.previewFields.destination,
    availabilityDate: p.previewFields.availabilityDate,
    contactEmail: p.previewFields.contactEmail,
    contactPhone: p.previewFields.contactPhone,
  };

  return (
    <section
      aria-labelledby="tratamiento-comercial"
      className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
    >
      <h2 id="tratamiento-comercial" className="text-lg font-bold">
        {p.sectionTitle}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{p.freeUseNote}</p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {saved && (
        <p data-testid="privacy-saved" className="mt-3 text-sm text-[var(--color-success)]">
          {p.saved}
        </p>
      )}

      <fieldset className="mt-4" disabled={!canChange || busy}>
        <legend className="text-sm font-medium">{p.modeLegend}</legend>
        <div className="mt-2 space-y-2">
          {modeOptions.map((o) => (
            <label key={o.value} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="commercial-mode"
                data-testid={`mode-${o.value}`}
                value={o.value}
                checked={mode === o.value}
                onChange={() => chooseMode(o.value)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <span className="font-medium">{o.label}</span>
                <span className="block text-xs text-[var(--color-text-muted)]">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode !== "none" && (
        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <fieldset disabled={!canChange || busy}>
            <legend className="text-sm font-medium">{p.channelLegend}</legend>
            <select
              data-testid="commercial-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as CommercialContactChannel)}
              className="mt-2 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm sm:max-w-xs"
            >
              <option value="email">{p.channels.email}</option>
              <option value="phone">{p.channels.phone}</option>
              <option value="both">{p.channels.both}</option>
            </select>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {channel !== "phone" && (
                <label className="block text-sm">
                  <span className="font-medium">{p.channelEmailLabel}</span>
                  <input
                    type="email"
                    data-testid="commercial-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                  />
                </label>
              )}
              {channel !== "email" && (
                <label className="block text-sm">
                  <span className="font-medium">{p.channelPhoneLabel}</span>
                  <input
                    type="tel"
                    data-testid="commercial-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                  />
                </label>
              )}
            </div>
            <button
              type="button"
              data-testid="commercial-channel-save"
              onClick={() =>
                void post({ channel, contactEmail: email.trim(), contactPhone: phone.trim() })
              }
              className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
            >
              {p.save}
            </button>
          </fieldset>

          <div className="mt-4">
            <p className="text-sm font-medium">{p.previewTitle}</p>
            <ul
              data-testid="commercial-preview"
              className="mt-1 list-disc pl-5 text-sm text-[var(--color-text-muted)]"
            >
              {sharedFieldKeys(channel).map((k) => (
                <li key={k}>{previewLabels[k]}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">{p.previewNever}</p>
          </div>

          {treatment.grantedAt && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {p.acceptedAt(treatment.grantedAt.toISOString().slice(0, 10))}
            </p>
          )}

          {canChange && (
            <button
              type="button"
              data-testid="commercial-revoke"
              disabled={busy}
              onClick={() => {
                if (!window.confirm(p.revokeConfirm)) return;
                setMode("none");
                void post({ action: "revoke" });
              }}
              className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-danger)]"
            >
              {p.revoke}
            </button>
          )}
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
          {p.moreInfo}
        </summary>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{p.moreInfoBody}</p>
      </details>

      {!canChange && <p className="mt-3 text-xs text-[var(--color-text-muted)]">{p.ownerOnly}</p>}
    </section>
  );
}
