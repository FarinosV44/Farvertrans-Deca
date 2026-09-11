"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "./field";
import { SaveShipment } from "./save-shipment";
import { step1Schema, step2Schema, step3Schema, shipmentSchema } from "@/lib/deca/schema";
import { validateDeca } from "@/lib/deca/validate";
import { leadSchema } from "@/lib/deca/lead";
import { track, getSessionId } from "@/lib/analytics/client";
import { looksLikeSpanishPlate } from "@/lib/deca/plate";
import { upperText } from "@/lib/text/normalize";
import { clientFingerprint, solveChallenge } from "@/lib/abuse/client";
import { useT } from "@/lib/i18n/client";

type FormState = {
  shipperName: string;
  shipperNif: string;
  shipperAddress: string;
  shipperPostalCode: string;
  shipperCity: string;
  carrierName: string;
  carrierNif: string;
  carrierAddress: string;
  carrierPostalCode: string;
  carrierCity: string;
  loadLocationName: string;
  loadLocationAddress: string;
  loadLocationPostalCode: string;
  loadLocationCity: string;
  loadLocationProvince: string;
  loadLocationCountry: string;
  loadDate: string;
  unloadLocationName: string;
  unloadLocationAddress: string;
  unloadLocationPostalCode: string;
  unloadLocationCity: string;
  unloadLocationProvince: string;
  unloadLocationCountry: string;
  unloadDate: string;
  goods: string;
  weight: string;
  tractorPlate: string;
  trailerPlate: string;
  reference: string;
  // #84 — per-DeCA commercial-share opt-in. NOT part of the legal payload:
  // sent as a separate body key, never written to `data_json`.
  commercialShareEnabled: string; // "1" | ""
  commercialShareDestination: string;
  commercialShareDate: string;
  commercialShareChannel: string; // "" | "email" | "phone" | "both"
};

const EMPTY: FormState = {
  shipperName: "",
  shipperNif: "",
  shipperAddress: "",
  shipperPostalCode: "",
  shipperCity: "",
  carrierName: "",
  carrierNif: "",
  carrierAddress: "",
  carrierPostalCode: "",
  carrierCity: "",
  loadLocationName: "",
  loadLocationAddress: "",
  loadLocationPostalCode: "",
  loadLocationCity: "",
  loadLocationProvince: "",
  loadLocationCountry: "España",
  loadDate: "",
  unloadLocationName: "",
  unloadLocationAddress: "",
  unloadLocationPostalCode: "",
  unloadLocationCity: "",
  unloadLocationProvince: "",
  unloadLocationCountry: "España",
  unloadDate: "",
  goods: "",
  weight: "",
  tractorPlate: "",
  trailerPlate: "",
  reference: "",
  commercialShareEnabled: "",
  commercialShareDestination: "",
  commercialShareDate: "",
  commercialShareChannel: "",
};

/**
 * #112 — one additional shipment ("envío") beyond the always-present first
 * one (which stays `FormState`'s own load/unload/goods/weight fields,
 * unchanged). Origin/destination/goods/weight/recipient are always explicit
 * here, never defaulted; loadDate/unloadDate/tractorPlate/trailerPlate/notes
 * are pre-filled from the DeCA-level values when a block is added, but are
 * always submitted explicitly too — an unedited pre-filled value and an
 * "inherited" one resolve identically server-side, so there is no need to
 * track which fields were actually touched.
 */
export type ExtraShipment = {
  loadLocationName: string;
  loadLocationAddress: string;
  loadLocationPostalCode: string;
  loadLocationCity: string;
  loadLocationProvince: string;
  loadLocationCountry: string;
  unloadLocationName: string;
  unloadLocationAddress: string;
  unloadLocationPostalCode: string;
  unloadLocationCity: string;
  unloadLocationProvince: string;
  unloadLocationCountry: string;
  goods: string;
  weight: string;
  recipient: string;
  loadDate: string;
  unloadDate: string;
  tractorPlate: string;
  trailerPlate: string;
  notes: string;
  /**
   * #113 — which SavedLocation (if any) currently backs this leg's origin/
   * destination. Client-only bookkeeping (never submitted in the DeCA
   * payload): lets "☆ Guardar como envío habitual" offer itself only when
   * both legs are already saved places (issue §12 — never duplicate address
   * text), and lets a hand-edit drop the credit like `picked` does for
   * shipment 1.
   */
  loadLocationId?: string;
  unloadLocationId?: string;
};

function emptyExtraShipment(f: FormState): ExtraShipment {
  return {
    loadLocationName: "",
    loadLocationAddress: "",
    loadLocationPostalCode: "",
    loadLocationCity: "",
    loadLocationProvince: "",
    loadLocationCountry: f.loadLocationCountry || "España",
    unloadLocationName: "",
    unloadLocationAddress: "",
    unloadLocationPostalCode: "",
    unloadLocationCity: "",
    unloadLocationProvince: "",
    unloadLocationCountry: f.unloadLocationCountry || "España",
    goods: "",
    weight: "",
    recipient: "",
    loadDate: f.loadDate,
    unloadDate: f.unloadDate,
    tractorPlate: f.tractorPlate,
    trailerPlate: f.trailerPlate,
    notes: "",
  };
}

function extraShipmentToPayload(s: ExtraShipment) {
  return {
    loadLocation: {
      name: s.loadLocationName,
      address: s.loadLocationAddress,
      postalCode: s.loadLocationPostalCode,
      city: s.loadLocationCity,
      province: s.loadLocationProvince,
      country: s.loadLocationCountry,
    },
    unloadLocation: {
      name: s.unloadLocationName,
      address: s.unloadLocationAddress,
      postalCode: s.unloadLocationPostalCode,
      city: s.unloadLocationCity,
      province: s.unloadLocationProvince,
      country: s.unloadLocationCountry,
    },
    goods: s.goods,
    weight: s.weight,
    recipient: s.recipient || undefined,
    loadDate: s.loadDate,
    unloadDate: s.unloadDate,
    tractorPlate: s.tractorPlate,
    trailerPlate: s.trailerPlate || undefined,
    notes: s.notes || undefined,
  };
}

const STORAGE_KEY = "fvd_crear_draft";

/** zod payload path → flat FormState field id (both the client and the 422 path use this). */
const FIELD_KEY_MAP: Record<string, keyof FormState> = {
  "shipper.name": "shipperName",
  "shipper.nif": "shipperNif",
  "shipper.address": "shipperAddress",
  "shipper.postalCode": "shipperPostalCode",
  "shipper.city": "shipperCity",
  "carrier.name": "carrierName",
  "carrier.nif": "carrierNif",
  "carrier.address": "carrierAddress",
  "carrier.postalCode": "carrierPostalCode",
  "carrier.city": "carrierCity",
  "loadLocation.name": "loadLocationName",
  "loadLocation.address": "loadLocationAddress",
  "loadLocation.postalCode": "loadLocationPostalCode",
  "loadLocation.city": "loadLocationCity",
  "loadLocation.province": "loadLocationProvince",
  "loadLocation.country": "loadLocationCountry",
  "unloadLocation.name": "unloadLocationName",
  "unloadLocation.address": "unloadLocationAddress",
  "unloadLocation.postalCode": "unloadLocationPostalCode",
  "unloadLocation.city": "unloadLocationCity",
  "unloadLocation.province": "unloadLocationProvince",
  "unloadLocation.country": "unloadLocationCountry",
};

export type SavedData = {
  companies: {
    id: string;
    name: string;
    nif: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    role: "shipper" | "carrier" | "both";
  }[];
  vehicles: {
    id: string;
    tractorPlate: string;
    trailerPlate: string | null;
    alias: string | null;
  }[];
  locations: {
    id: string;
    name: string;
    address: string;
    postalCode: string | null;
    city: string | null;
    province: string | null;
    country: string;
    type: "load" | "unload" | "both";
  }[];
  /** #113 — "rutas/envíos habituales": one reusable leg, fills an ENVÍO N block in one action. */
  shipments: SavedShipmentOption[];
};

type SavedShipmentLocation = {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string;
};

export type SavedShipmentOption = {
  id: string;
  name: string | null;
  loadLocationId: string;
  unloadLocationId: string;
  loadLocation: SavedShipmentLocation;
  unloadLocation: SavedShipmentLocation;
  goods: string | null;
  weight: string | null;
  recipient: string | null;
};

/** Display label for a saved-shipment `<option>` — the name if set, else "ORIGEN → DESTINO". */
export function savedShipmentLabel(s: SavedShipmentOption): string {
  if (s.name) return s.name;
  const from = s.loadLocation.city || s.loadLocation.name;
  const to = s.unloadLocation.city || s.unloadLocation.name;
  return `${from} → ${to}`;
}

type TemplateLocation = {
  name?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
};

/** A template's shipment BEYOND the first (#113 §5 — a whole recurring multi-envío lane). */
export type WizardTemplateShipment = {
  loadLocation?: TemplateLocation;
  unloadLocation?: TemplateLocation;
  goods?: string;
  weight?: string;
  recipient?: string;
  tractorPlate?: string;
  trailerPlate?: string;
  notes?: string;
};

export type WizardTemplate = {
  id: string;
  name: string;
  shipper?: { name?: string; nif?: string; address?: string; postalCode?: string; city?: string };
  carrier?: { name?: string; nif?: string; address?: string; postalCode?: string; city?: string };
  loadLocation?: TemplateLocation;
  unloadLocation?: TemplateLocation;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
  /** #113 §5 — present only for a template saved from an already multi-shipment DeCA. */
  shipments?: WizardTemplateShipment[];
};

/** A template shipment never carries a date (see `SaveTemplate`'s doc comment) — the
 *  operator fills loadDate/unloadDate by hand, exactly like a freshly added envío. */
function templateShipmentToExtra(ts: WizardTemplateShipment, tpl: WizardTemplate): ExtraShipment {
  return {
    loadLocationName: ts.loadLocation?.name || "",
    loadLocationAddress: ts.loadLocation?.address || "",
    loadLocationPostalCode: ts.loadLocation?.postalCode || "",
    loadLocationCity: ts.loadLocation?.city || "",
    loadLocationProvince: ts.loadLocation?.province || "",
    loadLocationCountry: ts.loadLocation?.country || "España",
    unloadLocationName: ts.unloadLocation?.name || "",
    unloadLocationAddress: ts.unloadLocation?.address || "",
    unloadLocationPostalCode: ts.unloadLocation?.postalCode || "",
    unloadLocationCity: ts.unloadLocation?.city || "",
    unloadLocationProvince: ts.unloadLocation?.province || "",
    unloadLocationCountry: ts.unloadLocation?.country || "España",
    goods: ts.goods || "",
    weight: ts.weight || "",
    recipient: ts.recipient || "",
    loadDate: "",
    unloadDate: "",
    tractorPlate: ts.tractorPlate || tpl.tractorPlate || "",
    trailerPlate: ts.trailerPlate || tpl.trailerPlate || "",
    notes: ts.notes || "",
  };
}

export type WizardCompany = {
  name: string;
  nif: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
};

/** Pre-fill for the duplicate flow (a source DeCA's payload, date left blank). */
/** #112: shipments BEYOND the first, for pre-filling a correction of an
 *  already-multi-shipment DeCA (shipment 1 stays `FormState`'s own fields,
 *  same as always). */
export type WizardInitial = Partial<FormState> & { extraShipments?: ExtraShipment[] };

/** Always the flat, single-shipment shape — used by `validateStep()`, which
 *  validates the current step's OWN fields regardless of any extra
 *  shipments (#112). */
function toFlatFields(f: FormState) {
  return {
    shipper: {
      name: f.shipperName,
      nif: f.shipperNif,
      address: f.shipperAddress,
      postalCode: f.shipperPostalCode,
      city: f.shipperCity,
    },
    carrier: {
      name: f.carrierName,
      nif: f.carrierNif,
      address: f.carrierAddress,
      postalCode: f.carrierPostalCode,
      city: f.carrierCity,
    },
    loadLocation: {
      name: f.loadLocationName,
      address: f.loadLocationAddress,
      postalCode: f.loadLocationPostalCode,
      city: f.loadLocationCity,
      province: f.loadLocationProvince,
      country: f.loadLocationCountry,
    },
    unloadLocation: {
      name: f.unloadLocationName,
      address: f.unloadLocationAddress,
      postalCode: f.unloadLocationPostalCode,
      city: f.unloadLocationCity,
      province: f.unloadLocationProvince,
      country: f.unloadLocationCountry,
    },
    loadDate: f.loadDate,
    unloadDate: f.unloadDate,
    goods: f.goods,
    weight: f.weight,
    tractorPlate: f.tractorPlate,
    trailerPlate: f.trailerPlate || undefined,
    reference: f.reference || undefined,
  };
}

/**
 * #112: when `extraShipments` is empty (the default, still the common case)
 * this returns EXACTLY the pre-#112 flat body — byte-identical to before —
 * since the server's schema accepts that shape unchanged. Only when the
 * operator has actually added another envío does the body gain a
 * `shipments` array (shipment 1 built from `f`'s own fields, same as
 * always, plus each extra one).
 */
function toPayload(f: FormState, extraShipments: ExtraShipment[] = []) {
  const flat = toFlatFields(f);
  if (extraShipments.length === 0) return flat;
  const { loadLocation, unloadLocation, goods, weight, ...deca } = flat;
  return {
    ...deca,
    shipments: [
      { loadLocation, unloadLocation, goods, weight },
      ...extraShipments.map(extraShipmentToPayload),
    ],
  };
}

/**
 * Read-only summary of everything that will go on the DeCA — shown on the last
 * step before GENERAR DECA so the operator confirms the exact final data (F1).
 * The blocks mirror the PDF sections, and each carries an `Editar` action that
 * jumps back to the step that owns it (UX #31).
 */
function ReviewSummary({
  form,
  onEdit,
  extraShipments = [],
}: {
  form: FormState;
  onEdit: (step: number) => void;
  /** #112 — shipments beyond the first, shown as their own read-only blocks
   *  so nothing is generated "invisibly" — before this, only shipment 1
   *  appeared in the review even when the toggle was on. */
  extraShipments?: ExtraShipment[];
}) {
  const t = useT();
  const r = t.crear.review;
  // #86 p3 / FIX: the review mirrors the generated document, so every textual
  // value shows uppercase here too. NIF, postal code, dates and weight keep
  // their normal format.
  const verbatim = new Set([r.nif, r.postalCode, r.loadDate, r.unloadDate, r.weight]);
  const disp = (label: string, value: string) =>
    verbatim.has(label) || !value ? value : upperText(value);
  const blocks: { title: string; step: number; key: string; rows: [string, string][] }[] = [
    {
      title: r.shipperTitle,
      step: 0,
      key: "shipper",
      rows: [
        [r.name, form.shipperName],
        [r.nif, form.shipperNif],
        [r.address, form.shipperAddress],
        [r.postalCode, form.shipperPostalCode],
        [r.city, form.shipperCity],
      ],
    },
    {
      title: r.carrierTitle,
      step: 0,
      key: "carrier",
      rows: [
        [r.name, form.carrierName],
        [r.nif, form.carrierNif],
        [r.address, form.carrierAddress],
        [r.postalCode, form.carrierPostalCode],
        [r.city, form.carrierCity],
      ],
    },
    {
      title: r.loadTitle,
      step: 1,
      key: "load",
      rows: [
        [r.locationName, form.loadLocationName],
        [r.locationAddress, form.loadLocationAddress],
        [r.postalCode, form.loadLocationPostalCode],
        [r.city, form.loadLocationCity],
        [r.province, form.loadLocationProvince],
        [r.country, form.loadLocationCountry],
        [r.loadDate, form.loadDate],
      ],
    },
    {
      title: r.unloadTitle,
      step: 1,
      key: "unload",
      rows: [
        [r.locationName, form.unloadLocationName],
        [r.locationAddress, form.unloadLocationAddress],
        [r.postalCode, form.unloadLocationPostalCode],
        [r.city, form.unloadLocationCity],
        [r.province, form.unloadLocationProvince],
        [r.country, form.unloadLocationCountry],
        [r.unloadDate, form.unloadDate],
      ],
    },
    {
      title: r.vehicleTitle,
      step: 2,
      key: "goods",
      rows: [
        [r.tractorPlate, form.tractorPlate],
        [r.trailerPlate, form.trailerPlate || "—"],
        [r.goods, form.goods],
        [r.weight, form.weight],
        ...(form.reference ? ([[r.reference, form.reference]] as [string, string][]) : []),
        ...(form.commercialShareEnabled === "1"
          ? ([
              [
                r.commercialShare,
                `${r.commercialShareOn}${
                  form.commercialShareDestination || form.unloadLocationCity
                    ? ` · ${form.commercialShareDestination || form.unloadLocationCity}`
                    : ""
                }`,
              ],
            ] as [string, string][])
          : []),
      ],
    },
    // #112: one read-only block per extra shipment, so a multi-shipment
    // DeCA never generates something the review never showed. "Editar"
    // points back to step 2, where every shipment block lives.
    ...extraShipments.map((s, i) => ({
      title: t.crear.shipments.heading(i + 2),
      step: 2,
      key: `shipment-${i}`,
      rows: [
        [r.locationName + " (carga)", s.loadLocationName],
        [r.locationName + " (descarga)", s.unloadLocationName],
        [r.goods, s.goods],
        [r.weight, s.weight],
        ...(s.recipient
          ? ([[t.crear.shipments.recipient, s.recipient]] as [string, string][])
          : []),
      ] as [string, string][],
    })),
  ];
  return (
    <section
      data-testid="review-summary"
      aria-labelledby="review-summary-h"
      className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h2 id="review-summary-h" className="text-base font-bold">
        {r.heading}
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{r.subhead}</p>
      <div className="mt-3 space-y-3">
        {blocks.map((b) => (
          <div
            key={b.key}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold">{b.title}</h3>
              <button
                type="button"
                data-testid={`review-edit-${b.key}`}
                onClick={() => onEdit(b.step)}
                className="shrink-0 text-sm font-medium text-[var(--color-primary)]"
              >
                {r.edit}
              </button>
            </div>
            <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {b.rows.map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-xs font-medium text-[var(--color-text-muted)]">{k}</dt>
                  <dd className="text-sm break-words">{disp(k, v) || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * #71 — a light pre-generation check shown on the review step. It re-runs the
 * SAME zod schemas the server validates with (`step1/2/3Schema` +
 * `validateDeca`), so it can never green-light something the backend will
 * reject and never needs a second set of rules. It makes no legal claim — just
 * "the mandatory data is complete" — and every problem row jumps to its field.
 */
function DecaCheck({
  form,
  onFix,
}: {
  form: FormState;
  onFix: (step: number, fieldId?: string) => void;
}) {
  const t = useT();
  const c = t.crear.check;
  const p = toFlatFields(form);

  const s1 = step1Schema.safeParse({ shipper: p.shipper, carrier: p.carrier });
  const s2 = step2Schema.safeParse({
    loadLocation: p.loadLocation,
    unloadLocation: p.unloadLocation,
    loadDate: p.loadDate,
    unloadDate: p.unloadDate,
  });
  const s3 = step3Schema.safeParse({
    goods: p.goods,
    weight: p.weight,
    tractorPlate: p.tractorPlate,
    trailerPlate: p.trailerPlate,
    reference: p.reference,
  });
  const issues = (r: typeof s1 | typeof s2 | typeof s3): Record<string, string> =>
    r.success
      ? {}
      : r.error.issues.reduce<Record<string, string>>((acc, i) => {
          const k = i.path.join(".");
          if (!(k in acc)) acc[k] = i.message;
          return acc;
        }, {});
  const e1 = issues(s1);
  const e2 = issues(s2);
  const e3 = issues(s3);

  const firstErr = (obj: Record<string, string>, ...prefixes: string[]) => {
    for (const prefix of prefixes) {
      const k = Object.keys(obj).find((x) => x === prefix || x.startsWith(`${prefix}.`));
      if (k) return { msg: obj[k], fieldId: (FIELD_KEY_MAP[k] as string) ?? k };
    }
    return null;
  };

  const rows = [
    { label: c.items.shipper, step: 0, err: firstErr(e1, "shipper") },
    { label: c.items.carrier, step: 0, err: firstErr(e1, "carrier") },
    { label: c.items.route, step: 1, err: firstErr(e2, "loadLocation", "unloadLocation") },
    { label: c.items.dates, step: 1, err: firstErr(e2, "loadDate", "unloadDate") },
    { label: c.items.goods, step: 2, err: firstErr(e3, "goods", "weight") },
    { label: c.items.tractor, step: 2, err: firstErr(e3, "tractorPlate") },
  ];

  const hasError = rows.some((r) => r.err);
  let warnings: string[] = [];
  if (!hasError) {
    try {
      warnings = validateDeca(p).warnings;
    } catch {
      /* structurally complete but validateDeca threw — treat as an error state */
    }
  }
  const status: "ready" | "review" | "missing" = hasError
    ? "missing"
    : warnings.length
      ? "review"
      : "ready";
  // Static class strings — Tailwind cannot see an interpolated token name.
  const PILL: Record<typeof status, string> = {
    ready:
      "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_28%,transparent)]",
    review:
      "bg-[var(--color-warn-bg)] text-[var(--color-warn)] border-[color-mix(in_srgb,var(--color-warn)_28%,transparent)]",
    missing:
      "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)]",
  };

  return (
    <section
      data-testid="deca-check"
      data-status={status}
      aria-label={c.title}
      className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold">{c.title}</h2>
        <span
          className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-semibold ${PILL[status]}`}
        >
          {c[status]}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start gap-2">
            <span
              aria-hidden
              className={row.err ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}
            >
              {row.err ? "✗" : "✓"}
            </span>
            <span className="flex-1">
              {row.err ? row.err.msg : row.label}
              {row.err && (
                <button
                  type="button"
                  data-testid={`deca-check-fix-${row.step}`}
                  onClick={() => onFix(row.step, row.err!.fieldId)}
                  className="ml-2 font-medium text-[var(--color-primary)] underline"
                >
                  {c.fix}
                </button>
              )}
            </span>
          </li>
        ))}
        {warnings.map((w) => (
          <li key={w} className="flex items-start gap-2">
            <span aria-hidden className="text-[var(--color-warn)]">
              ⚠
            </span>
            <span className="flex-1">{w}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{c.disclaimer}</p>
    </section>
  );
}

export function CrearWizard({
  initial,
  saved,
  templates,
  company,
  commercialTreatment,
  correctDecaId,
  authed = false,
  emailVerified = false,
}: {
  initial?: WizardInitial;
  saved?: SavedData;
  templates?: WizardTemplate[];
  /** The logged-in company, for "usar mi empresa" (UX #25). */
  company?: WizardCompany;
  /** The company's commercial-treatment preference (#84). Absent → no block. */
  commercialTreatment?: {
    mode: "none" | "per_deca" | "all";
    channel: "email" | "phone" | "both" | null;
  };
  /** When set, the wizard corrects an existing DeCA → a new version (R-13). */
  correctDecaId?: string;
  /**
   * Whether the visitor has an active session. An AUTHENTICATED caller must
   * be EMAIL-VERIFIED to generate (D-053) — this never gates entering data,
   * only the last step's actual submission, and is server-enforced
   * independently in `POST /api/deca` (403 `email_not_verified`).
   *
   * An anonymous visitor (D-060) is never blocked on account creation for
   * their FIRST document — they give just a name + email instead
   * (`showLeadGate` below). Which browser already used its one lead-gated
   * document is a page-level gate (`app/crear/page.tsx`, the `fvd_lead`
   * cookie), not this component's concern.
   */
  authed?: boolean;
  /** Whether the authenticated session's email is verified (D-053). Ignored while `!authed`. */
  emailVerified?: boolean;
} = {}) {
  const t = useT();
  const router = useRouter();
  const isCorrection = !!correctDecaId;
  const showLeadGate = !isCorrection && !authed;
  const needsVerification = !isCorrection && authed && !emailVerified;
  // #84 — the per-DeCA commercial block only exists for a logged-in company
  // that has opted into some sharing mode; never for the anonymous one-shot or
  // a correction.
  const showCommercialShare =
    authed && !isCorrection && !!company && (commercialTreatment?.mode ?? "none") !== "none";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const commercialShareOn = showCommercialShare && form.commercialShareEnabled === "1";
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** A classified generation failure (#29): calm message + correlation code + retry. */
  const [failure, setFailure] = useState<{ message: string; correlationId?: string } | null>(null);
  /**
   * Which saved records populated the form right now (WORKSPACE #24) — sent
   * with the create so the server can bump their "last used" timestamp.
   * Cleared as soon as the user hand-edits that field again, so a stale pick
   * never gets credited for data the user actually retyped.
   */
  const [picked, setPicked] = useState<{
    shipperId?: string;
    carrierId?: string;
    loadLocationId?: string;
    unloadLocationId?: string;
    vehicleId?: string;
  }>({});
  /**
   * Which quick-fill produced each party's data right now, so the same button
   * toggles it back OFF (clears those 3 fields) instead of being a one-way
   * action the operator can only undo by hand. A manual edit to that party
   * clears its flag, so a stale toggle never wipes retyped data.
   */
  const [quickFill, setQuickFill] = useState<{
    shipper?: "company" | "carrier";
    carrier?: "company" | "shipper";
  }>({});
  // D-060: identity captured before an anonymous FIRST DeCA (lib/deca/lead.ts).
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  // #112 — multiple shipments ("envíos"). Off by default: the common,
  // single-origin/destination flow is completely unaffected until this is
  // turned on. Pre-filled ON when correcting an already-multi-shipment DeCA
  // (`initial.extraShipments`, set by the corrección page) so its envíos
  // are never silently dropped. `extraShipmentErrors[i]` mirrors `errors`'s
  // shape but scoped to shipment `i` (1-based, since shipment 0 is `form`
  // itself).
  const [multiShipment, setMultiShipment] = useState(!!initial?.extraShipments?.length);
  const [extraShipments, setExtraShipments] = useState<ExtraShipment[]>(
    initial?.extraShipments ?? [],
  );
  const [extraShipmentErrors, setExtraShipmentErrors] = useState<Record<number, string>>({});
  /** #113 — ids of any "ruta/envío habitual" used to fill shipment 1 or an
   *  extra envío, so the server can bump their "last used" timestamp
   *  (mirrors `picked` above, but a DeCA can use several routes at once). */
  const [usedShipmentIds, setUsedShipmentIds] = useState<string[]>([]);
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
    [],
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // #84 — "all" means the porte control starts ON (still removable per porte).
  // "per_deca" starts OFF. Only set the default once, on mount.
  const commercialDefaultRef = useRef(false);
  useEffect(() => {
    if (commercialDefaultRef.current) return;
    commercialDefaultRef.current = true;
    if (
      showCommercialShare &&
      commercialTreatment?.mode === "all" &&
      !initial?.commercialShareEnabled
    ) {
      setForm((f) => ({
        ...f,
        commercialShareEnabled: "1",
        commercialShareChannel:
          f.commercialShareChannel || (commercialTreatment.channel ?? "email"),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore a draft on mount; fire deca_started once. A duplicate (`initial`)
  // always wins over a stale draft.
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      if (!isCorrection) track("deca_started");
      if (initial) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) setForm({ ...EMPTY, ...(JSON.parse(raw) as Partial<FormState>) });
      } catch {
        /* ignore */
      }
    }
  }, [initial, isCorrection]);

  // Persist the draft as the user types (survives refresh).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  // #76: an authenticated in-progress DeCA is also saved server-side (debounced),
  // so it shows on the panel and survives a device change. Not while correcting
  // (that is an existing document) and not the untouched first render.
  const draftDirty = useRef(false);
  useEffect(() => {
    if (!authed || isCorrection) return;
    if (!draftDirty.current) {
      draftDirty.current = true;
      return;
    }
    const h = setTimeout(() => {
      void fetch("/api/deca/draft", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
        keepalive: true,
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(h);
  }, [form, authed, isCorrection]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  /** Same as `set`, but also drops the "picked" credit for that saved record (hand-edited now). */
  const setAndUnpick = (k: keyof FormState, pickKey: keyof typeof picked) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setPicked((p) => (p[pickKey] ? { ...p, [pickKey]: undefined } : p));
    // A hand edit to shipper/carrier drops that party's quick-fill flag so the
    // toggle button can't later wipe data the operator retyped (#).
    const party = k.startsWith("shipper") ? "shipper" : k.startsWith("carrier") ? "carrier" : null;
    if (party) setQuickFill((q) => (q[party] ? { ...q, [party]: undefined } : q));
  };

  /** #112: set one field on extra shipment `i`. */
  const setExtra = (i: number, k: keyof ExtraShipment) => (v: string) =>
    setExtraShipments((arr) => arr.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  /** #113: patch several fields on extra shipment `i` at once (a saved-place/route pick). */
  const setExtraFields = (i: number, patch: Partial<ExtraShipment>) =>
    setExtraShipments((arr) => arr.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  /** Same as `setExtra`, but also drops the "picked" credit for that leg (hand-edited now) —
   *  mirrors `setAndUnpick` for shipment 1, so "☆ Guardar como envío habitual" never offers
   *  itself for a leg the operator has since retyped away from the place it was picked from. */
  const setExtraAndUnpick =
    (i: number, k: keyof ExtraShipment, pickKey: "loadLocationId" | "unloadLocationId") =>
    (v: string) =>
      setExtraShipments((arr) =>
        arr.map((s, j) => (j === i ? { ...s, [k]: v, [pickKey]: undefined } : s)),
      );
  const applySavedShipmentTo = (r: SavedShipmentOption, i: number) => {
    setExtraFields(i, {
      loadLocationName: r.loadLocation.name,
      loadLocationAddress: r.loadLocation.address,
      loadLocationPostalCode: r.loadLocation.postalCode ?? "",
      loadLocationCity: r.loadLocation.city ?? "",
      loadLocationProvince: r.loadLocation.province ?? "",
      loadLocationCountry: r.loadLocation.country,
      unloadLocationName: r.unloadLocation.name,
      unloadLocationAddress: r.unloadLocation.address,
      unloadLocationPostalCode: r.unloadLocation.postalCode ?? "",
      unloadLocationCity: r.unloadLocation.city ?? "",
      unloadLocationProvince: r.unloadLocation.province ?? "",
      unloadLocationCountry: r.unloadLocation.country,
      goods: r.goods || "",
      weight: r.weight || "",
      recipient: r.recipient || "",
      loadLocationId: r.loadLocationId,
      unloadLocationId: r.unloadLocationId,
    });
    setUsedShipmentIds((ids) => (ids.includes(r.id) ? ids : [...ids, r.id]));
  };

  /**
   * The 4 party quick-fills are toggles: press once to fill from `source`,
   * press again (same button) to clear those 3 fields. `party` is the target;
   * `mode` records which button so pressing a *different* one just re-fills.
   */
  const partyQuickFill = (
    party: "shipper" | "carrier",
    mode: "company" | "carrier" | "shipper",
    values: () => { name: string; nif: string; address: string; postalCode: string; city: string },
  ) => {
    const on = quickFill[party] === mode;
    setForm((f) => {
      const v = on ? { name: "", nif: "", address: "", postalCode: "", city: "" } : values();
      return {
        ...f,
        [`${party}Name`]: v.name,
        [`${party}Nif`]: v.nif,
        [`${party}Address`]: v.address,
        [`${party}PostalCode`]: v.postalCode,
        [`${party}City`]: v.city,
      };
    });
    setPicked((p) => ({ ...p, [`${party}Id`]: undefined }));
    setQuickFill((q) => ({ ...q, [party]: on ? undefined : mode }));
  };
  const quickBtn = (active: boolean) =>
    `rounded-[var(--radius-md)] border px-3 py-1.5 font-medium ${
      active
        ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
        : "border-[var(--color-border)]"
    }`;

  const plateHint =
    form.tractorPlate && !looksLikeSpanishPlate(form.tractorPlate)
      ? t.crear.hints.plateForeign
      : undefined;

  function validateStep(): boolean {
    const p = toFlatFields(form);
    const schema = [step1Schema, step2Schema, step3Schema][step];
    const slice =
      step === 0
        ? { shipper: p.shipper, carrier: p.carrier }
        : step === 1
          ? {
              loadLocation: p.loadLocation,
              unloadLocation: p.unloadLocation,
              loadDate: p.loadDate,
              unloadDate: p.unloadDate,
            }
          : {
              goods: p.goods,
              weight: p.weight,
              tractorPlate: p.tractorPlate,
              trailerPlate: p.trailerPlate,
              reference: p.reference,
            };
    const r = schema.safeParse(slice);
    if (r.success) {
      setErrors({});
      return true;
    }
    const flat: Record<string, string> = {};
    const order: string[] = [];
    for (const i of r.error.issues) {
      const path = i.path.join(".");
      const key = FIELD_KEY_MAP[path] ?? path;
      if (!(key in flat)) order.push(key);
      flat[key] = i.message;
    }
    setErrors(flat);
    // Send focus straight to the first field that needs fixing (UX #31); the
    // error summary is still there for screen-reader users who prefer the list.
    requestAnimationFrame(() => {
      const first = order[0] && document.getElementById(order[0]);
      if (first instanceof HTMLElement) first.focus();
      else summaryRef.current?.focus();
    });
    return false;
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(2, s + 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  async function postDeca(challenge?: string) {
    return fetch("/api/deca", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
        "x-fvd-session": getSessionId(),
        "x-fvd-fp": clientFingerprint(),
        ...(challenge ? { "x-fvd-challenge": challenge } : {}),
      },
      body: JSON.stringify({
        ...toPayload(form, multiShipment ? extraShipments : []),
        // WORKSPACE #24 / #113: which saved records this DeCA actually used,
        // so the server can bump their "last used" timestamp. Best-effort
        // only — never validated against the payload, never blocks
        // generation. `extraLocationIds`/`shipmentIds` cover the envíos
        // beyond the first, which `picked` (shipment 1 only) doesn't reach.
        usedSaved: {
          ...picked,
          extraLocationIds: (multiShipment ? extraShipments : []).flatMap((s) =>
            [s.loadLocationId, s.unloadLocationId].filter((v): v is string => !!v),
          ),
          shipmentIds: usedShipmentIds,
        },
        // D-060: opportunistic lead capture for an anonymous first DeCA — the
        // server ignores these fields for an authenticated caller.
        ...(showLeadGate ? { leadName, leadEmail } : {}),
        // #84: per-DeCA commercial-share opt-in. A SEPARATE key — never merged
        // into the legal payload, never written to `data_json`. Only sent when
        // the operator ticked the box; the server re-checks the live preference.
        ...(commercialShareOn
          ? {
              commercialShare: {
                enabled: true,
                destination: form.commercialShareDestination.trim() || undefined,
                availabilityDate: form.commercialShareDate.trim() || undefined,
                channel: form.commercialShareChannel || commercialTreatment?.channel || "email",
              },
            }
          : {}),
      }),
    });
  }

  async function submit() {
    if (needsVerification || !validateStep() || submitting) return;
    if (isCorrection && reason.trim().length < 3) {
      setErrors({ reason: t.crear.correctionReasonRequired });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (showLeadGate) {
      const leadParsed = leadSchema.safeParse({ leadName, leadEmail });
      if (!leadParsed.success) {
        const flat: Record<string, string> = {};
        for (const issue of leadParsed.error.issues) {
          const key = issue.path[0] === "leadEmail" ? "leadEmail" : "leadName";
          flat[key] = issue.message;
        }
        setErrors(flat);
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
    }
    // #112 — each extra shipment re-runs the SAME schema the server
    // validates with, same principle as `DecaCheck` above for shipment 1.
    if (multiShipment) {
      if (extraShipments.length === 0) {
        setErrors({});
        setExtraShipmentErrors({ 0: t.crear.shipments.minOneError });
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      const fieldErrors: Record<number, string> = {};
      extraShipments.forEach((s, i) => {
        const r = shipmentSchema.safeParse(extraShipmentToPayload(s));
        if (!r.success) fieldErrors[i + 1] = r.error.issues[0]?.message ?? "";
      });
      if (Object.keys(fieldErrors).length > 0) {
        setExtraShipmentErrors(fieldErrors);
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setExtraShipmentErrors({});
    }
    setSubmitting(true);
    setSubmitError(null);
    setFailure(null);
    try {
      if (isCorrection) {
        const res = await fetch(`/api/deca/${correctDecaId}/version`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            changeReason: reason.trim(),
            payload: toPayload(form, multiShipment ? extraShipments : []),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(data?.error?.message ?? t.crear.correctionSaveFailed);
          setSubmitting(false);
          return;
        }
        track("deca_corrected");
        router.push(`/panel/deca/${correctDecaId}`);
        return;
      }

      let res = await postDeca();
      let data = await res.json().catch(() => ({}));

      // Abuse challenge: solve it invisibly and retry once.
      if (res.status === 429 && data?.error?.code === "challenge") {
        setSubmitError(t.crear.checkingChallenge);
        const answer = await solveChallenge({
          type: data.error.challenge?.type ?? "pow",
          prefix: data.error.challenge?.prefix,
          difficulty: data.error.challenge?.difficulty,
        });
        if (answer) {
          setSubmitError(null);
          res = await postDeca(answer);
          data = await res.json().catch(() => ({}));
        }
      }

      if (!res.ok) {
        // A classified server-side failure keeps the draft intact and offers a
        // retry with the SAME idempotency key, so it can never duplicate (#29).
        // Any other 5xx (an unclassified crash) gets the same treatment rather
        // than a dead-end message — the draft is never lost either way.
        if (data?.error?.code === "generation_failed" || res.status >= 500) {
          setFailure({
            message: data?.error?.message ?? t.crear.generationFailedFallback,
            correlationId: data?.error?.correlationId,
          });
          setSubmitting(false);
          requestAnimationFrame(() => failureRef.current?.focus());
          return;
        }
        if (res.status === 422 && data?.error?.fields) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.error.fields as Record<string, string[]>)) {
            flat[FIELD_KEY_MAP[k] ?? k] = v[0];
          }
          setErrors(flat);
          setStep(0);
        }
        setSubmitError(data?.error?.message ?? t.crear.generationFailedGeneric);
        setSubmitting(false);
        return;
      }
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      // #76: the draft became a real DeCA — drop the server copy.
      if (authed && !isCorrection) void fetch("/api/deca/draft", { method: "DELETE" });
      if (data.firstForCompany) track("first_authenticated_deca");
      const q = data.claimToken ? `?claim=${encodeURIComponent(data.claimToken)}` : "";
      router.push(`/crear/${data.decaId}${q}`);
    } catch {
      setFailure({ message: t.crear.noConnection });
      setSubmitting(false);
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  }

  const errorList = Object.entries(errors);
  const stepLabel = t.crear.steps[step];

  return (
    <div>
      {/* Sistema Vía (#67): the DeCA-creation flow carries the "línea de
          creación" (route colour), distinct from the primary blue. */}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[var(--color-text-muted)]">
        <span
          aria-hidden
          className="mr-0.5 inline-block h-[3px] w-7 flex-none bg-[var(--color-route)] align-middle"
        />
        {t.crear.stepOf(step + 1)} <span className="text-[var(--color-text)]">{stepLabel}</span>
      </p>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-border)]"
        role="progressbar"
        aria-label={t.crear.stepOfAria(step + 1, stepLabel)}
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        <div
          className="h-full bg-[var(--color-route)] transition-[width]"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-2xl font-bold outline-none md:text-3xl"
      >
        {stepLabel}
      </h1>
      {isCorrection ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.crear.correctionIntro}</p>
      ) : (
        showLeadGate && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.crear.subheadLeadGate}</p>
        )
      )}

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          data-testid="error-summary"
          className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[#fdecec] p-4 outline-none"
        >
          <p className="font-bold text-[var(--color-danger)]">{t.crear.errorSummaryTitle}</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {errorList.map(([k, v]) => (
              <li key={k}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) next();
          else void submit();
        }}
        noValidate
      >
        {step === 0 && (
          <>
            {!isCorrection && templates && templates.length > 0 && (
              <label className="mt-4 block text-sm">
                <span className="font-medium">{t.crear.templates.legend}</span>
                <select
                  data-testid="template-picker"
                  className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const tpl = templates.find((x) => x.id === e.target.value);
                    if (tpl)
                      setForm((f) => ({
                        ...f,
                        shipperName: tpl.shipper?.name || f.shipperName,
                        shipperNif: tpl.shipper?.nif || f.shipperNif,
                        shipperAddress: tpl.shipper?.address || f.shipperAddress,
                        shipperPostalCode: tpl.shipper?.postalCode || f.shipperPostalCode,
                        shipperCity: tpl.shipper?.city || f.shipperCity,
                        carrierName: tpl.carrier?.name || f.carrierName,
                        carrierNif: tpl.carrier?.nif || f.carrierNif,
                        carrierAddress: tpl.carrier?.address || f.carrierAddress,
                        carrierPostalCode: tpl.carrier?.postalCode || f.carrierPostalCode,
                        carrierCity: tpl.carrier?.city || f.carrierCity,
                        loadLocationName: tpl.loadLocation?.name || f.loadLocationName,
                        loadLocationAddress: tpl.loadLocation?.address || f.loadLocationAddress,
                        loadLocationPostalCode:
                          tpl.loadLocation?.postalCode || f.loadLocationPostalCode,
                        loadLocationCity: tpl.loadLocation?.city || f.loadLocationCity,
                        loadLocationProvince: tpl.loadLocation?.province || f.loadLocationProvince,
                        loadLocationCountry: tpl.loadLocation?.country || f.loadLocationCountry,
                        unloadLocationName: tpl.unloadLocation?.name || f.unloadLocationName,
                        unloadLocationAddress:
                          tpl.unloadLocation?.address || f.unloadLocationAddress,
                        unloadLocationPostalCode:
                          tpl.unloadLocation?.postalCode || f.unloadLocationPostalCode,
                        unloadLocationCity: tpl.unloadLocation?.city || f.unloadLocationCity,
                        unloadLocationProvince:
                          tpl.unloadLocation?.province || f.unloadLocationProvince,
                        unloadLocationCountry:
                          tpl.unloadLocation?.country || f.unloadLocationCountry,
                        goods: tpl.goods || f.goods,
                        weight: tpl.weight || f.weight,
                        tractorPlate: tpl.tractorPlate || f.tractorPlate,
                        trailerPlate: tpl.trailerPlate || f.trailerPlate,
                      }));
                    // #113 §5 — a template saved from a multi-envío DeCA carries its
                    // extra shipments too; prefill them the same way a legacy
                    // single-shipment template always has (no regression there).
                    if (tpl?.shipments && tpl.shipments.length > 0) {
                      setMultiShipment(true);
                      setExtraShipments(
                        tpl.shipments.map((ts) => templateShipmentToExtra(ts, tpl)),
                      );
                    }
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">{t.crear.templates.placeholder}</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  {t.crear.templates.hint}
                </span>
              </label>
            )}
            {!isCorrection && company && (
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  data-testid="use-my-company-shipper"
                  aria-pressed={quickFill.shipper === "company"}
                  onClick={() =>
                    partyQuickFill("shipper", "company", () => ({
                      name: company.name,
                      nif: company.nif ?? "",
                      address: company.address ?? "",
                      postalCode: company.postalCode ?? "",
                      city: company.city ?? "",
                    }))
                  }
                  className={quickBtn(quickFill.shipper === "company")}
                >
                  {t.crear.useCompany.shipper}
                </button>
                <button
                  type="button"
                  data-testid="use-my-company-carrier"
                  aria-pressed={quickFill.carrier === "company"}
                  onClick={() =>
                    partyQuickFill("carrier", "company", () => ({
                      name: company.name,
                      nif: company.nif ?? "",
                      address: company.address ?? "",
                      postalCode: company.postalCode ?? "",
                      city: company.city ?? "",
                    }))
                  }
                  className={quickBtn(quickFill.carrier === "company")}
                >
                  {t.crear.useCompany.carrier}
                </button>
              </div>
            )}
            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">{t.crear.legends.shipper}</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t.crear.sectionHints.shipper}
              </p>
              {saved && saved.companies.filter((c) => c.role !== "carrier").length > 0 && (
                <label className="mt-3 block text-sm">
                  <span className="font-medium">{t.crear.autofill.company}</span>
                  <select
                    data-testid="autofill-shipper"
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                    defaultValue=""
                    onChange={(e) => {
                      const c = saved.companies.find((x) => x.id === e.target.value);
                      if (c) {
                        setForm((f) => ({
                          ...f,
                          shipperName: c.name,
                          shipperNif: c.nif ?? "",
                          shipperAddress: c.address ?? f.shipperAddress,
                          shipperPostalCode: c.postalCode ?? f.shipperPostalCode,
                          shipperCity: c.city ?? f.shipperCity,
                        }));
                        setPicked((p) => ({ ...p, shipperId: c.id }));
                      }
                      e.currentTarget.value = "";
                    }}
                  >
                    <option value="">{t.crear.autofill.newOption}</option>
                    {saved.companies
                      .filter((c) => c.role !== "carrier")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.nif ? ` — ${c.nif}` : ""}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <Field
                id="shipperName"
                label={t.crear.fields.name}
                value={form.shipperName}
                onChange={setAndUnpick("shipperName", "shipperId")}
                error={errors.shipperName}
                autoComplete="organization"
              />
              <Field
                id="shipperNif"
                label={t.crear.fields.nif}
                value={form.shipperNif}
                onChange={setAndUnpick("shipperNif", "shipperId")}
                error={errors.shipperNif}
                hint={t.crear.hints.nifForeign}
              />
              <Field
                id="shipperAddress"
                label={t.crear.fields.address}
                value={form.shipperAddress}
                onChange={setAndUnpick("shipperAddress", "shipperId")}
                error={errors.shipperAddress}
                autoComplete="street-address"
              />
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field
                  id="shipperPostalCode"
                  label={t.crear.fields.postalCode}
                  value={form.shipperPostalCode}
                  onChange={setAndUnpick("shipperPostalCode", "shipperId")}
                  error={errors.shipperPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="shipperCity"
                  label={t.crear.fields.city}
                  value={form.shipperCity}
                  onChange={setAndUnpick("shipperCity", "shipperId")}
                  error={errors.shipperCity}
                  autoComplete="address-level2"
                />
              </div>
            </fieldset>

            {(form.shipperName || form.carrierName) && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  data-testid="use-same-shipper-as-carrier"
                  aria-pressed={quickFill.carrier === "shipper"}
                  onClick={() =>
                    partyQuickFill("carrier", "shipper", () => ({
                      name: form.shipperName,
                      nif: form.shipperNif,
                      address: form.shipperAddress,
                      postalCode: form.shipperPostalCode,
                      city: form.shipperCity,
                    }))
                  }
                  className={quickBtn(quickFill.carrier === "shipper")}
                >
                  {t.crear.useSame.shipperIsCarrier}
                </button>
                <button
                  type="button"
                  data-testid="use-same-carrier-as-shipper"
                  aria-pressed={quickFill.shipper === "carrier"}
                  onClick={() =>
                    partyQuickFill("shipper", "carrier", () => ({
                      name: form.carrierName,
                      nif: form.carrierNif,
                      address: form.carrierAddress,
                      postalCode: form.carrierPostalCode,
                      city: form.carrierCity,
                    }))
                  }
                  className={quickBtn(quickFill.shipper === "carrier")}
                >
                  {t.crear.useSame.carrierIsShipper}
                </button>
              </div>
            )}

            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">{t.crear.legends.carrier}</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t.crear.sectionHints.carrier}
              </p>
              {saved && saved.companies.filter((c) => c.role !== "shipper").length > 0 && (
                <label className="mt-3 block text-sm">
                  <span className="font-medium">{t.crear.autofill.carrier}</span>
                  <select
                    data-testid="autofill-carrier"
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                    defaultValue=""
                    onChange={(e) => {
                      const c = saved.companies.find((x) => x.id === e.target.value);
                      if (c) {
                        setForm((f) => ({
                          ...f,
                          carrierName: c.name,
                          carrierNif: c.nif ?? "",
                          carrierAddress: c.address ?? f.carrierAddress,
                          carrierPostalCode: c.postalCode ?? f.carrierPostalCode,
                          carrierCity: c.city ?? f.carrierCity,
                        }));
                        setPicked((p) => ({ ...p, carrierId: c.id }));
                      }
                      e.currentTarget.value = "";
                    }}
                  >
                    <option value="">{t.crear.autofill.newOption}</option>
                    {saved.companies
                      .filter((c) => c.role !== "shipper")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.nif ? ` — ${c.nif}` : ""}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <Field
                id="carrierName"
                label={t.crear.fields.name}
                value={form.carrierName}
                onChange={setAndUnpick("carrierName", "carrierId")}
                error={errors.carrierName}
                autoComplete="organization"
              />
              <Field
                id="carrierNif"
                label={t.crear.fields.nif}
                value={form.carrierNif}
                onChange={setAndUnpick("carrierNif", "carrierId")}
                error={errors.carrierNif}
                hint={t.crear.hints.nifForeign}
              />
              <Field
                id="carrierAddress"
                label={t.crear.fields.address}
                value={form.carrierAddress}
                onChange={setAndUnpick("carrierAddress", "carrierId")}
                error={errors.carrierAddress}
                autoComplete="street-address"
              />
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field
                  id="carrierPostalCode"
                  label={t.crear.fields.postalCode}
                  value={form.carrierPostalCode}
                  onChange={setAndUnpick("carrierPostalCode", "carrierId")}
                  error={errors.carrierPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="carrierCity"
                  label={t.crear.fields.city}
                  value={form.carrierCity}
                  onChange={setAndUnpick("carrierCity", "carrierId")}
                  error={errors.carrierCity}
                  autoComplete="address-level2"
                />
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            {saved && saved.shipments.length > 0 && (
              <label className="mt-4 block text-sm">
                <span className="font-medium">{t.crear.autofill.shipment}</span>
                <select
                  data-testid="autofill-shipment"
                  className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const r = saved.shipments.find((x) => x.id === e.target.value);
                    if (r) {
                      setForm((f) => ({
                        ...f,
                        loadLocationName: r.loadLocation.name,
                        loadLocationAddress: r.loadLocation.address,
                        loadLocationPostalCode: r.loadLocation.postalCode ?? "",
                        loadLocationCity: r.loadLocation.city ?? "",
                        loadLocationProvince: r.loadLocation.province ?? "",
                        loadLocationCountry: r.loadLocation.country || f.loadLocationCountry,
                        unloadLocationName: r.unloadLocation.name,
                        unloadLocationAddress: r.unloadLocation.address,
                        unloadLocationPostalCode: r.unloadLocation.postalCode ?? "",
                        unloadLocationCity: r.unloadLocation.city ?? "",
                        unloadLocationProvince: r.unloadLocation.province ?? "",
                        unloadLocationCountry: r.unloadLocation.country || f.unloadLocationCountry,
                        goods: r.goods || f.goods,
                        weight: r.weight || f.weight,
                      }));
                      setPicked((p) => ({
                        ...p,
                        loadLocationId: r.loadLocationId,
                        unloadLocationId: r.unloadLocationId,
                      }));
                      setUsedShipmentIds((ids) => (ids.includes(r.id) ? ids : [...ids, r.id]));
                    }
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">{t.crear.autofill.newOption}</option>
                  {saved.shipments.map((r) => (
                    <option key={r.id} value={r.id}>
                      {savedShipmentLabel(r)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">{t.crear.legends.loadLocation}</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t.crear.sectionHints.loadLocation}
              </p>
              {saved && saved.locations.filter((l) => l.type !== "unload").length > 0 && (
                <label className="mt-3 block text-sm">
                  <span className="font-medium">{t.crear.autofill.location}</span>
                  <select
                    data-testid="autofill-load-location"
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                    defaultValue=""
                    onChange={(e) => {
                      const l = saved.locations.find((x) => x.id === e.target.value);
                      if (l) {
                        setForm((f) => ({
                          ...f,
                          loadLocationName: l.name,
                          loadLocationAddress: l.address,
                          loadLocationPostalCode: l.postalCode ?? "",
                          loadLocationCity: l.city ?? "",
                          loadLocationProvince: l.province ?? "",
                          loadLocationCountry: l.country || f.loadLocationCountry,
                        }));
                        setPicked((p) => ({ ...p, loadLocationId: l.id }));
                      }
                      e.currentTarget.value = "";
                    }}
                  >
                    <option value="">{t.crear.autofill.newOption}</option>
                    {saved.locations
                      .filter((l) => l.type !== "unload")
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                          {l.city ? ` — ${l.city}` : ""}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <Field
                id="loadLocationName"
                label={t.crear.fields.locationName}
                value={form.loadLocationName}
                onChange={setAndUnpick("loadLocationName", "loadLocationId")}
                error={errors.loadLocationName}
                autoComplete="organization"
              />
              <Field
                id="loadLocationAddress"
                label={t.crear.fields.locationAddress}
                value={form.loadLocationAddress}
                onChange={set("loadLocationAddress")}
                error={errors.loadLocationAddress}
                autoComplete="street-address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="loadLocationPostalCode"
                  label={t.crear.fields.postalCode}
                  value={form.loadLocationPostalCode}
                  onChange={set("loadLocationPostalCode")}
                  error={errors.loadLocationPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="loadLocationCity"
                  label={t.crear.fields.city}
                  value={form.loadLocationCity}
                  onChange={set("loadLocationCity")}
                  error={errors.loadLocationCity}
                  autoComplete="address-level2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="loadLocationProvince"
                  label={t.crear.fields.province}
                  value={form.loadLocationProvince}
                  onChange={set("loadLocationProvince")}
                  error={errors.loadLocationProvince}
                  autoComplete="address-level1"
                  required={false}
                />
                <Field
                  id="loadLocationCountry"
                  label={t.crear.fields.country}
                  value={form.loadLocationCountry}
                  onChange={set("loadLocationCountry")}
                  error={errors.loadLocationCountry}
                  autoComplete="country-name"
                />
              </div>
              <Field
                id="loadDate"
                label={t.crear.fields.loadDate}
                type="date"
                value={form.loadDate}
                onChange={set("loadDate")}
                error={errors.loadDate}
              />
            </fieldset>

            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">{t.crear.legends.unloadLocation}</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t.crear.sectionHints.unloadLocation}
              </p>
              {saved && saved.locations.filter((l) => l.type !== "load").length > 0 && (
                <label className="mt-3 block text-sm">
                  <span className="font-medium">{t.crear.autofill.location}</span>
                  <select
                    data-testid="autofill-unload-location"
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                    defaultValue=""
                    onChange={(e) => {
                      const l = saved.locations.find((x) => x.id === e.target.value);
                      if (l) {
                        setForm((f) => ({
                          ...f,
                          unloadLocationName: l.name,
                          unloadLocationAddress: l.address,
                          unloadLocationPostalCode: l.postalCode ?? "",
                          unloadLocationCity: l.city ?? "",
                          unloadLocationProvince: l.province ?? "",
                          unloadLocationCountry: l.country || f.unloadLocationCountry,
                        }));
                        setPicked((p) => ({ ...p, unloadLocationId: l.id }));
                      }
                      e.currentTarget.value = "";
                    }}
                  >
                    <option value="">{t.crear.autofill.newOption}</option>
                    {saved.locations
                      .filter((l) => l.type !== "load")
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                          {l.city ? ` — ${l.city}` : ""}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <Field
                id="unloadLocationName"
                label={t.crear.fields.locationName}
                value={form.unloadLocationName}
                onChange={setAndUnpick("unloadLocationName", "unloadLocationId")}
                error={errors.unloadLocationName}
                autoComplete="organization"
              />
              <Field
                id="unloadLocationAddress"
                label={t.crear.fields.locationAddress}
                value={form.unloadLocationAddress}
                onChange={set("unloadLocationAddress")}
                error={errors.unloadLocationAddress}
                autoComplete="street-address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="unloadLocationPostalCode"
                  label={t.crear.fields.postalCode}
                  value={form.unloadLocationPostalCode}
                  onChange={set("unloadLocationPostalCode")}
                  error={errors.unloadLocationPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="unloadLocationCity"
                  label={t.crear.fields.city}
                  value={form.unloadLocationCity}
                  onChange={set("unloadLocationCity")}
                  error={errors.unloadLocationCity}
                  autoComplete="address-level2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="unloadLocationProvince"
                  label={t.crear.fields.province}
                  value={form.unloadLocationProvince}
                  onChange={set("unloadLocationProvince")}
                  error={errors.unloadLocationProvince}
                  autoComplete="address-level1"
                  required={false}
                />
                <Field
                  id="unloadLocationCountry"
                  label={t.crear.fields.country}
                  value={form.unloadLocationCountry}
                  onChange={set("unloadLocationCountry")}
                  error={errors.unloadLocationCountry}
                  autoComplete="country-name"
                />
              </div>
              <Field
                id="unloadDate"
                label={t.crear.fields.unloadDate}
                type="date"
                value={form.unloadDate}
                onChange={set("unloadDate")}
                error={errors.unloadDate}
                hint={t.crear.hints.unloadSameDay}
              />
            </fieldset>
          </>
        )}

        {step === 2 && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">{t.crear.legends.vehicleGoods}</legend>
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">
              {t.crear.sectionHints.vehicleGoods}
            </p>
            {saved && saved.vehicles.length > 0 && (
              <label className="block text-sm">
                <span className="font-medium">{t.crear.autofill.vehicle}</span>
                <select
                  data-testid="autofill-vehicle"
                  className="mt-1 mb-2 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const v = saved.vehicles.find((x) => x.id === e.target.value);
                    if (v) {
                      setForm((f) => ({
                        ...f,
                        tractorPlate: v.tractorPlate,
                        trailerPlate: v.trailerPlate ?? "",
                      }));
                      setPicked((p) => ({ ...p, vehicleId: v.id }));
                    }
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">{t.crear.autofill.newOption}</option>
                  {saved.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.alias ? `${v.alias} — ${v.tractorPlate}` : v.tractorPlate}
                      {v.trailerPlate ? ` + ${v.trailerPlate}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Field
              id="goods"
              label={t.crear.fields.goods}
              value={form.goods}
              onChange={set("goods")}
              error={errors.goods}
            />
            <Field
              id="weight"
              label={t.crear.fields.weight}
              value={form.weight}
              onChange={set("weight")}
              error={errors.weight}
              hint={t.crear.fields.weightHint}
            />
            <Field
              id="tractorPlate"
              label={t.crear.fields.tractorPlate}
              value={form.tractorPlate}
              onChange={setAndUnpick("tractorPlate", "vehicleId")}
              error={errors.tractorPlate}
              hint={plateHint}
            />
            <Field
              id="trailerPlate"
              label={t.crear.fields.trailerPlate}
              value={form.trailerPlate}
              onChange={setAndUnpick("trailerPlate", "vehicleId")}
              error={errors.trailerPlate}
              required={false}
              hint={t.crear.fields.trailerHint}
            />
            <Field
              id="reference"
              label={t.crear.fields.reference}
              value={form.reference}
              onChange={set("reference")}
              error={errors.reference}
              required={false}
            />
            {showLeadGate && (
              <div
                data-testid="lead-gate"
                className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-soft,#eef4ff)] p-4"
              >
                <p className="font-bold text-[var(--color-primary)]">{t.crear.lead.title}</p>
                <p className="mt-1 text-sm">{t.crear.lead.body}</p>
                <Field
                  id="leadName"
                  label={t.crear.lead.name}
                  value={leadName}
                  onChange={setLeadName}
                  error={errors.leadName}
                  autoComplete="name"
                />
                <Field
                  id="leadEmail"
                  label={t.crear.lead.email}
                  type="email"
                  value={leadEmail}
                  onChange={setLeadEmail}
                  error={errors.leadEmail}
                  autoComplete="email"
                />
                <p className="mt-1 text-sm">
                  <Link href="/entrar?next=%2Fcrear">{t.crear.lead.loginPrompt}</Link>{" "}
                  {t.crear.lead.loginPromptSuffix}
                </p>
              </div>
            )}
            {needsVerification && (
              <div
                data-testid="verify-gate"
                className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-soft,#eef4ff)] p-4"
              >
                <p className="font-bold text-[var(--color-primary)]">{t.crear.verifyGate.title}</p>
                <p className="mt-1 text-sm">{t.crear.verifyGate.body}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/verificar-email?next=%2Fcrear"
                    data-testid="verify-gate-link"
                    className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 font-medium text-[var(--color-primary-contrast)] no-underline"
                  >
                    {t.crear.verifyGate.cta}
                  </Link>
                </div>
              </div>
            )}
            {isCorrection && (
              <div className="mt-3">
                <label htmlFor="reason" className="block text-sm font-medium">
                  {t.crear.correctionReason} *
                </label>
                <textarea
                  id="reason"
                  data-testid="correction-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  aria-invalid={errors.reason ? true : undefined}
                  aria-describedby={errors.reason ? "reason-error" : undefined}
                  className={`mt-1 block min-h-20 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-base ${
                    errors.reason ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                  }`}
                />
                {errors.reason && (
                  <p id="reason-error" className="mt-1 text-sm text-[var(--color-danger)]">
                    {errors.reason}
                  </p>
                )}
              </div>
            )}
            {!isCorrection && picked.loadLocationId && picked.unloadLocationId && (
              <SaveShipment
                loadLocationId={picked.loadLocationId}
                unloadLocationId={picked.unloadLocationId}
                goods={form.goods}
                weight={form.weight}
                suggestedName={
                  form.loadLocationCity && form.unloadLocationCity
                    ? `${form.loadLocationCity} → ${form.unloadLocationCity}`
                    : ""
                }
              />
            )}
          </fieldset>
        )}

        {/* #112 — multiple shipments ("envíos"). Available during a
            correction too (Sprint 2): the corrección page pre-loads any
            existing extra envíos into `initial.extraShipments`, so nothing
            is silently dropped when correcting an already-multi-shipment
            DeCA. */}
        {step === 2 && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">{t.crear.shipments.toggle}</legend>
            <p className="text-xs text-[var(--color-text-muted)]">{t.crear.shipments.toggleHint}</p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                data-testid="multi-shipment-toggle"
                checked={multiShipment}
                onChange={(e) => {
                  const on = e.target.checked;
                  setMultiShipment(on);
                  setExtraShipmentErrors({});
                  if (on) {
                    if (extraShipments.length === 0) setExtraShipments([emptyExtraShipment(form)]);
                  } else {
                    setExtraShipments([]);
                  }
                }}
              />
              <span>{t.crear.shipments.toggle}</span>
            </label>

            {multiShipment && (
              <div className="mt-4 space-y-4">
                {extraShipmentErrors[0] && (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {extraShipmentErrors[0]}
                  </p>
                )}
                {extraShipments.map((s, i) => (
                  <div
                    key={i}
                    data-testid={`extra-shipment-${i + 1}`}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold">{t.crear.shipments.heading(i + 2)}</p>
                      <button
                        type="button"
                        data-testid={`extra-shipment-remove-${i + 1}`}
                        onClick={() =>
                          setExtraShipments((arr) => {
                            const next = arr.filter((_, j) => j !== i);
                            if (next.length === 0) setMultiShipment(false);
                            return next;
                          })
                        }
                        className="text-sm font-medium text-[var(--color-danger)] underline"
                      >
                        {t.crear.shipments.remove}
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {t.crear.shipments.ownFieldsHint}
                    </p>
                    {extraShipmentErrors[i + 1] && (
                      <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                        {extraShipmentErrors[i + 1]}
                      </p>
                    )}
                    {saved && saved.shipments.length > 0 && (
                      <label className="mt-3 block text-sm">
                        <span className="font-medium">{t.crear.autofill.shipment}</span>
                        <select
                          data-testid={`autofill-shipment-extra-${i + 1}`}
                          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                          defaultValue=""
                          onChange={(e) => {
                            const r = saved.shipments.find((x) => x.id === e.target.value);
                            if (r) applySavedShipmentTo(r, i);
                            e.currentTarget.value = "";
                          }}
                        >
                          <option value="">{t.crear.autofill.newOption}</option>
                          {saved.shipments.map((r) => (
                            <option key={r.id} value={r.id}>
                              {savedShipmentLabel(r)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <p className="mt-3 text-xs font-bold uppercase text-[var(--color-text-muted)]">
                      {t.crear.legends.loadLocation}
                    </p>
                    <Field
                      id={`extraLoadName${i}`}
                      label={t.crear.fields.locationName}
                      value={s.loadLocationName}
                      onChange={setExtraAndUnpick(i, "loadLocationName", "loadLocationId")}
                    />
                    <Field
                      id={`extraLoadAddress${i}`}
                      label={t.crear.fields.locationAddress}
                      value={s.loadLocationAddress}
                      onChange={setExtraAndUnpick(i, "loadLocationAddress", "loadLocationId")}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={`extraLoadPostalCode${i}`}
                        label={t.crear.fields.postalCode}
                        value={s.loadLocationPostalCode}
                        onChange={setExtraAndUnpick(i, "loadLocationPostalCode", "loadLocationId")}
                      />
                      <Field
                        id={`extraLoadCity${i}`}
                        label={t.crear.fields.city}
                        value={s.loadLocationCity}
                        onChange={setExtraAndUnpick(i, "loadLocationCity", "loadLocationId")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={`extraLoadProvince${i}`}
                        label={t.crear.fields.province}
                        value={s.loadLocationProvince}
                        onChange={setExtraAndUnpick(i, "loadLocationProvince", "loadLocationId")}
                        required={false}
                      />
                      <Field
                        id={`extraLoadCountry${i}`}
                        label={t.crear.fields.country}
                        value={s.loadLocationCountry}
                        onChange={setExtraAndUnpick(i, "loadLocationCountry", "loadLocationId")}
                      />
                    </div>

                    <p className="mt-3 text-xs font-bold uppercase text-[var(--color-text-muted)]">
                      {t.crear.legends.unloadLocation}
                    </p>
                    <Field
                      id={`extraUnloadName${i}`}
                      label={t.crear.fields.locationName}
                      value={s.unloadLocationName}
                      onChange={setExtraAndUnpick(i, "unloadLocationName", "unloadLocationId")}
                    />
                    <Field
                      id={`extraUnloadAddress${i}`}
                      label={t.crear.fields.locationAddress}
                      value={s.unloadLocationAddress}
                      onChange={setExtraAndUnpick(i, "unloadLocationAddress", "unloadLocationId")}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={`extraUnloadPostalCode${i}`}
                        label={t.crear.fields.postalCode}
                        value={s.unloadLocationPostalCode}
                        onChange={setExtraAndUnpick(
                          i,
                          "unloadLocationPostalCode",
                          "unloadLocationId",
                        )}
                      />
                      <Field
                        id={`extraUnloadCity${i}`}
                        label={t.crear.fields.city}
                        value={s.unloadLocationCity}
                        onChange={setExtraAndUnpick(i, "unloadLocationCity", "unloadLocationId")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={`extraUnloadProvince${i}`}
                        label={t.crear.fields.province}
                        value={s.unloadLocationProvince}
                        onChange={setExtraAndUnpick(
                          i,
                          "unloadLocationProvince",
                          "unloadLocationId",
                        )}
                        required={false}
                      />
                      <Field
                        id={`extraUnloadCountry${i}`}
                        label={t.crear.fields.country}
                        value={s.unloadLocationCountry}
                        onChange={setExtraAndUnpick(i, "unloadLocationCountry", "unloadLocationId")}
                      />
                    </div>

                    <Field
                      id={`extraGoods${i}`}
                      label={t.crear.fields.goods}
                      value={s.goods}
                      onChange={setExtra(i, "goods")}
                    />
                    <Field
                      id={`extraWeight${i}`}
                      label={t.crear.fields.weight}
                      value={s.weight}
                      onChange={setExtra(i, "weight")}
                      hint={t.crear.fields.weightHint}
                    />
                    <Field
                      id={`extraRecipient${i}`}
                      label={t.crear.shipments.recipient}
                      value={s.recipient}
                      onChange={setExtra(i, "recipient")}
                      required={false}
                    />

                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                      {t.crear.shipments.overridesHint}
                    </p>
                    <Field
                      id={`extraLoadDate${i}`}
                      label={t.crear.fields.loadDate}
                      type="date"
                      value={s.loadDate}
                      onChange={setExtra(i, "loadDate")}
                    />
                    <Field
                      id={`extraUnloadDate${i}`}
                      label={t.crear.fields.unloadDate}
                      type="date"
                      value={s.unloadDate}
                      onChange={setExtra(i, "unloadDate")}
                    />
                    <Field
                      id={`extraTractorPlate${i}`}
                      label={t.crear.fields.tractorPlate}
                      value={s.tractorPlate}
                      onChange={setExtra(i, "tractorPlate")}
                    />
                    <Field
                      id={`extraTrailerPlate${i}`}
                      label={t.crear.fields.trailerPlate}
                      value={s.trailerPlate}
                      onChange={setExtra(i, "trailerPlate")}
                      required={false}
                    />
                    <Field
                      id={`extraNotes${i}`}
                      label={t.crear.shipments.notes}
                      value={s.notes}
                      onChange={setExtra(i, "notes")}
                      required={false}
                    />
                    {s.loadLocationId && s.unloadLocationId && (
                      <SaveShipment
                        loadLocationId={s.loadLocationId}
                        unloadLocationId={s.unloadLocationId}
                        goods={s.goods}
                        weight={s.weight}
                        recipient={s.recipient}
                        suggestedName={
                          s.loadLocationCity && s.unloadLocationCity
                            ? `${s.loadLocationCity} → ${s.unloadLocationCity}`
                            : ""
                        }
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  data-testid="add-shipment"
                  onClick={() => setExtraShipments((arr) => [...arr, emptyExtraShipment(form)])}
                  className="rounded-[var(--radius-md)] border border-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]"
                >
                  {t.crear.shipments.addAnother}
                </button>
              </div>
            )}
          </fieldset>
        )}

        {step === 2 && showCommercialShare && (
          <fieldset
            data-testid="commercial-share"
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
          >
            <legend className="px-1 text-sm font-bold">{t.crear.commercialShare.legend}</legend>
            <p className="text-xs text-[var(--color-text-muted)]">{t.crear.commercialShare.hint}</p>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                data-testid="commercial-share-enable"
                checked={form.commercialShareEnabled === "1"}
                onChange={(e) => set("commercialShareEnabled")(e.target.checked ? "1" : "")}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>{t.crear.commercialShare.enable}</span>
            </label>
            {form.commercialShareEnabled === "1" && (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">{t.crear.commercialShare.destination}</span>
                    <input
                      data-testid="commercial-share-destination"
                      value={form.commercialShareDestination}
                      placeholder={form.unloadLocationCity}
                      onChange={(e) => set("commercialShareDestination")(e.target.value)}
                      className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">{t.crear.commercialShare.date}</span>
                    <input
                      type="date"
                      data-testid="commercial-share-date"
                      value={form.commercialShareDate}
                      placeholder={form.unloadDate}
                      onChange={(e) => set("commercialShareDate")(e.target.value)}
                      className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="font-medium">{t.crear.commercialShare.channel}</span>
                  <select
                    data-testid="commercial-share-channel"
                    value={form.commercialShareChannel || commercialTreatment?.channel || "email"}
                    onChange={(e) => set("commercialShareChannel")(e.target.value)}
                    className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm sm:max-w-xs"
                  >
                    <option value="email">{t.crear.commercialShare.channels.email}</option>
                    <option value="phone">{t.crear.commercialShare.channels.phone}</option>
                    <option value="both">{t.crear.commercialShare.channels.both}</option>
                  </select>
                </label>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t.crear.commercialShare.previewTitle} {t.crear.fields.name},{" "}
                  {t.crear.commercialShare.destination}, {t.crear.commercialShare.date}
                  {(form.commercialShareChannel || commercialTreatment?.channel || "email") !==
                    "phone" && `, ${t.panel.privacy.previewFields.contactEmail}`}
                  {(form.commercialShareChannel || commercialTreatment?.channel || "email") !==
                    "email" && `, ${t.panel.privacy.previewFields.contactPhone}`}
                  .
                </p>
              </div>
            )}
            <Link
              href="/panel/privacidad"
              className="mt-3 inline-block text-xs font-medium text-[var(--color-primary)]"
            >
              {t.crear.commercialShare.manage}
            </Link>
          </fieldset>
        )}

        {step === 2 && !isCorrection && (
          <>
            <DecaCheck
              form={form}
              onFix={(s, fieldId) => {
                setErrors({});
                setStep(s);
                if (fieldId) requestAnimationFrame(() => document.getElementById(fieldId)?.focus());
              }}
            />
            <ReviewSummary
              form={form}
              extraShipments={multiShipment ? extraShipments : []}
              onEdit={(s) => {
                setErrors({});
                setStep(s);
              }}
            />
          </>
        )}

        {submitting && !isCorrection && (
          <p
            role="status"
            data-testid="generating-status"
            className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
          >
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            {t.crear.generatingStatus}
          </p>
        )}

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
            {submitError}
          </p>
        )}

        {failure && (
          <div
            ref={failureRef}
            tabIndex={-1}
            role="alert"
            data-testid="generation-failure"
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft,#fff5f5)] p-4"
          >
            <p className="font-medium text-[var(--color-danger)]">{t.crear.notGenerated}</p>
            <p className="mt-1 text-sm">{failure.message}</p>
            {failure.correlationId && (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {t.crear.correlationPrefix}{" "}
                <strong data-testid="failure-code">{failure.correlationId}</strong>{" "}
                {t.crear.correlationSuffix}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                data-testid="retry-generate"
                onClick={() => void submit()}
                disabled={submitting}
                className="btn-primary min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
              >
                {submitting ? t.crear.buttons.generating : t.crear.retry}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFailure(null);
                  setStep(0);
                }}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-medium"
              >
                {t.crear.backToReview}
              </button>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-10 mt-6 flex gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg)] py-3 sm:static sm:border-0 sm:bg-transparent sm:py-0">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 font-medium text-[var(--color-primary)]"
            >
              {t.crear.buttons.back}
            </button>
          )}
          {!(step === 2 && needsVerification) && (
            <button
              type="submit"
              disabled={submitting}
              data-testid={step < 2 ? "wizard-next" : "wizard-generate"}
              className="min-h-12 flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-55"
            >
              {step < 2
                ? t.crear.buttons.next
                : submitting
                  ? t.crear.buttons.generating
                  : isCorrection
                    ? t.crear.buttons.saveCorrection
                    : t.crear.buttons.generate}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
