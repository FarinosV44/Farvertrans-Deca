"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "./field";
import { step1Schema, step2Schema, step3Schema } from "@/lib/deca/schema";
import { leadSchema } from "@/lib/deca/lead";
import { track, getSessionId } from "@/lib/analytics/client";
import { looksLikeSpanishPlate } from "@/lib/deca/plate";
import { clientFingerprint, solveChallenge } from "@/lib/abuse/client";
import { useT } from "@/lib/i18n/client";

type FormState = {
  shipperName: string;
  shipperNif: string;
  shipperAddress: string;
  carrierName: string;
  carrierNif: string;
  carrierAddress: string;
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
};

const EMPTY: FormState = {
  shipperName: "",
  shipperNif: "",
  shipperAddress: "",
  carrierName: "",
  carrierNif: "",
  carrierAddress: "",
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
};

const STORAGE_KEY = "fvd_crear_draft";

/** zod payload path → flat FormState field id (both the client and the 422 path use this). */
const FIELD_KEY_MAP: Record<string, keyof FormState> = {
  "shipper.name": "shipperName",
  "shipper.nif": "shipperNif",
  "shipper.address": "shipperAddress",
  "carrier.name": "carrierName",
  "carrier.nif": "carrierNif",
  "carrier.address": "carrierAddress",
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
};

type TemplateLocation = {
  name?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
};

export type WizardTemplate = {
  id: string;
  name: string;
  shipper?: { name?: string; nif?: string; address?: string };
  carrier?: { name?: string; nif?: string; address?: string };
  loadLocation?: TemplateLocation;
  unloadLocation?: TemplateLocation;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
};

export type WizardCompany = { name: string; nif: string | null; address: string | null };

/** Pre-fill for the duplicate flow (a source DeCA's payload, date left blank). */
export type WizardInitial = Partial<FormState>;

function toPayload(f: FormState) {
  return {
    shipper: { name: f.shipperName, nif: f.shipperNif, address: f.shipperAddress },
    carrier: { name: f.carrierName, nif: f.carrierNif, address: f.carrierAddress },
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
 * Read-only summary of everything that will go on the DeCA — shown on the last
 * step before GENERAR DECA so the operator confirms the exact final data (F1).
 * The blocks mirror the PDF sections, and each carries an `Editar` action that
 * jumps back to the step that owns it (UX #31).
 */
function ReviewSummary({ form, onEdit }: { form: FormState; onEdit: (step: number) => void }) {
  const t = useT();
  const r = t.crear.review;
  const blocks: { title: string; step: number; key: string; rows: [string, string][] }[] = [
    {
      title: r.shipperTitle,
      step: 0,
      key: "shipper",
      rows: [
        [r.name, form.shipperName],
        [r.nif, form.shipperNif],
        [r.address, form.shipperAddress],
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
      ],
    },
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
                  <dd className="text-sm break-words">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CrearWizard({
  initial,
  saved,
  templates,
  company,
  correctDecaId,
  authed = false,
  emailVerified = false,
}: {
  initial?: WizardInitial;
  saved?: SavedData;
  templates?: WizardTemplate[];
  /** The logged-in company, for "usar mi empresa" (UX #25). */
  company?: WizardCompany;
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial ? { ...EMPTY, ...initial } : EMPTY);
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
  // D-060: identity captured before an anonymous FIRST DeCA (lib/deca/lead.ts).
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
    [],
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

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

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  /** Same as `set`, but also drops the "picked" credit for that saved record (hand-edited now). */
  const setAndUnpick = (k: keyof FormState, pickKey: keyof typeof picked) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setPicked((p) => (p[pickKey] ? { ...p, [pickKey]: undefined } : p));
  };

  const plateHint =
    form.tractorPlate && !looksLikeSpanishPlate(form.tractorPlate)
      ? t.crear.hints.plateForeign
      : undefined;

  function validateStep(): boolean {
    const p = toPayload(form);
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
        ...toPayload(form),
        // WORKSPACE #24: which saved records this DeCA actually used, so the
        // server can bump their "last used" timestamp. Best-effort only —
        // never validated against the payload, never blocks generation.
        usedSaved: picked,
        // D-060: opportunistic lead capture for an anonymous first DeCA — the
        // server ignores these fields for an authenticated caller.
        ...(showLeadGate ? { leadName, leadEmail } : {}),
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
    setSubmitting(true);
    setSubmitError(null);
    setFailure(null);
    try {
      if (isCorrection) {
        const res = await fetch(`/api/deca/${correctDecaId}/version`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ changeReason: reason.trim(), payload: toPayload(form) }),
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
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        {t.crear.stepOf(step + 1)} <span className="text-[var(--color-text)]">{stepLabel}</span>
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-label={t.crear.stepOfAria(step + 1, stepLabel)}
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        <div
          className="h-full bg-[var(--color-primary)] transition-[width]"
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
                        carrierName: tpl.carrier?.name || f.carrierName,
                        carrierNif: tpl.carrier?.nif || f.carrierNif,
                        carrierAddress: tpl.carrier?.address || f.carrierAddress,
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
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      shipperName: company.name,
                      shipperNif: company.nif ?? "",
                      shipperAddress: company.address ?? "",
                    }))
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 font-medium"
                >
                  {t.crear.useCompany.shipper}
                </button>
                <button
                  type="button"
                  data-testid="use-my-company-carrier"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      carrierName: company.name,
                      carrierNif: company.nif ?? "",
                      carrierAddress: company.address ?? "",
                    }))
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 font-medium"
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
            </fieldset>

            {(form.shipperName || form.carrierName) && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  data-testid="use-same-shipper-as-carrier"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      carrierName: f.shipperName,
                      carrierNif: f.shipperNif,
                      carrierAddress: f.shipperAddress,
                    }))
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 font-medium"
                >
                  {t.crear.useSame.shipperIsCarrier}
                </button>
                <button
                  type="button"
                  data-testid="use-same-carrier-as-shipper"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      shipperName: f.carrierName,
                      shipperNif: f.carrierNif,
                      shipperAddress: f.carrierAddress,
                    }))
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 font-medium"
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
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
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
          </fieldset>
        )}

        {step === 2 && !isCorrection && (
          <ReviewSummary
            form={form}
            onEdit={(s) => {
              setErrors({});
              setStep(s);
            }}
          />
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
