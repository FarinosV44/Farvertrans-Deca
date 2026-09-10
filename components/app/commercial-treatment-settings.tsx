"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { RouteIcon } from "@/components/panel/icons";
import { sharedFieldKeys } from "@/lib/commercial/types";
import type {
  CommercialConsentMode,
  CommercialContactChannel,
  CommercialTreatmentState,
} from "@/lib/commercial/types";

/**
 * The **DECA Conecta** control (#84 → DECA Conecta rename). Opt-in, three modes
 * (`none` / `per_deca` / `all` — stored values and behaviour UNCHANGED by the
 * rename), revocable, with an exact preview of what would be shared. Owner-only
 * editable; members see the current state read-only. No pre-checked options, no
 * alarm colours — "No compartir en ningún porte" is the neutral default.
 * "Tratamiento comercial" is still the correct legal term for this processing
 * and remains in the privacy policy and consent logs; it is no longer the
 * visible feature title.
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
      aria-labelledby="deca-conecta"
      className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
    >
      <div className="flex items-center gap-1.5">
        <RouteIcon width={18} height={18} className="shrink-0 text-[var(--color-primary)]" />
        <h2 id="deca-conecta" className="text-lg font-bold">
          {p.sectionTitle}
        </h2>
      </div>
      <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">{p.tagline}</p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{p.supporting}</p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{p.freeUseNote}</p>

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

      <details className="mt-4" data-testid="deca-conecta-disclosure">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
          {p.disclosureTitle}
        </summary>
        <div className="mt-2 space-y-3 text-sm text-[var(--color-text-muted)]">
          <div>
            <p className="font-semibold text-[var(--color-text)]">{p.disclosure.howTitle}</p>
            <p className="mt-0.5">{p.disclosure.howBody}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{p.disclosure.matchTitle}</p>
            <ul className="mt-0.5 list-disc pl-5">
              {p.disclosure.matchItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{p.disclosure.contactTitle}</p>
            <ul className="mt-0.5 list-disc pl-5">
              {p.disclosure.contactItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{p.disclosure.neverTitle}</p>
            <ul className="mt-0.5 list-disc pl-5">
              {p.disclosure.neverItems.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          {[p.disclosure.recipients, p.disclosure.purpose, p.disclosure.revocation].map((line) => {
            const i = line.indexOf(": ");
            return i > 0 ? (
              <p key={line}>
                <span className="font-semibold text-[var(--color-text)]">
                  {line.slice(0, i + 1)}
                </span>{" "}
                {line.slice(i + 2)}
              </p>
            ) : (
              <p key={line}>{line}</p>
            );
          })}
        </div>
      </details>

      <p className="mt-3">
        <Link
          href="/blog/deca-conecta-ofertas-carga"
          data-testid="deca-conecta-article"
          className="text-sm text-[var(--color-primary)] underline"
        >
          {p.articleLink}
        </Link>
      </p>

      {!canChange && <p className="mt-3 text-xs text-[var(--color-text-muted)]">{p.ownerOnly}</p>}
    </section>
  );
}
