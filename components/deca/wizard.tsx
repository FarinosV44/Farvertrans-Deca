"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "./field";
import { step1Schema, step2Schema, step3Schema } from "@/lib/deca/schema";
import { track, getSessionId } from "@/lib/analytics/client";
import { looksLikeSpanishPlate } from "@/lib/deca/plate";
import { clientFingerprint, solveChallenge } from "@/lib/abuse/client";

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

/** Plain-language step names for the progress indicator (UX #31). */
const STEP_LABELS = [
  "Quién contrata y quién transporta",
  "Carga y descarga",
  "Vehículo, mercancía y revisión",
] as const;

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
  companies: { id: string; name: string; nif: string | null; address: string | null }[];
  vehicles: { id: string; tractorPlate: string; trailerPlate: string | null }[];
  addresses: { id: string; label: string; address: string }[];
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
  const blocks: { title: string; step: number; key: string; rows: [string, string][] }[] = [
    {
      title: "Empresa que contrata el transporte",
      step: 0,
      key: "shipper",
      rows: [
        ["Nombre o razón social", form.shipperName],
        ["NIF / VAT", form.shipperNif],
        ["Domicilio", form.shipperAddress],
      ],
    },
    {
      title: "Transportista que realiza el transporte",
      step: 0,
      key: "carrier",
      rows: [
        ["Nombre o razón social", form.carrierName],
        ["NIF / VAT", form.carrierNif],
        ["Domicilio", form.carrierAddress],
      ],
    },
    {
      title: "Lugar y fecha de carga",
      step: 1,
      key: "load",
      rows: [
        ["Empresa / establecimiento", form.loadLocationName],
        ["Dirección", form.loadLocationAddress],
        ["Código postal", form.loadLocationPostalCode],
        ["Localidad", form.loadLocationCity],
        ["Provincia", form.loadLocationProvince],
        ["País", form.loadLocationCountry],
        ["Fecha de carga", form.loadDate],
      ],
    },
    {
      title: "Lugar y fecha de descarga",
      step: 1,
      key: "unload",
      rows: [
        ["Empresa / establecimiento", form.unloadLocationName],
        ["Dirección", form.unloadLocationAddress],
        ["Código postal", form.unloadLocationPostalCode],
        ["Localidad", form.unloadLocationCity],
        ["Provincia", form.unloadLocationProvince],
        ["País", form.unloadLocationCountry],
        ["Fecha de descarga", form.unloadDate],
      ],
    },
    {
      title: "Vehículo y mercancía",
      step: 2,
      key: "goods",
      rows: [
        ["Matrícula tractora", form.tractorPlate],
        ["Matrícula remolque", form.trailerPlate || "—"],
        ["Mercancía", form.goods],
        ["Peso o medida", form.weight],
        ...(form.reference ? ([["Referencia", form.reference]] as [string, string][]) : []),
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
        Revisa antes de generar
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Estos son los datos exactos que aparecerán en el DeCA y en el PDF. Usa «Editar» si algo no
        es correcto.
      </p>
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
                Editar
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
   * Whether the visitor has an active session. A DeCA can only be FINALLY
   * generated by a registered, authenticated, EMAIL-VERIFIED user (D-053,
   * hardening PRIORITY 1) — this never gates entering data, only the last
   * step's actual submission. Server-enforced independently in
   * `POST /api/deca` (401 `auth_required` / 403 `email_not_verified`); these
   * flags only drive the UI.
   */
  authed?: boolean;
  /** Whether the authenticated session's email is verified (D-053). Ignored while `!authed`. */
  emailVerified?: boolean;
} = {}) {
  const router = useRouter();
  const isCorrection = !!correctDecaId;
  const needsAuth = !isCorrection && !authed;
  const needsVerification = !isCorrection && authed && !emailVerified;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** A classified generation failure (#29): calm message + correlation code + retry. */
  const [failure, setFailure] = useState<{ message: string; correlationId?: string } | null>(null);
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

  const plateHint =
    form.tractorPlate && !looksLikeSpanishPlate(form.tractorPlate)
      ? "No parece una matrícula española (formato 1234 BCD). Es válida si el vehículo es extranjero."
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
      body: JSON.stringify(toPayload(form)),
    });
  }

  async function submit() {
    if (needsAuth || needsVerification || !validateStep() || submitting) return;
    if (isCorrection && reason.trim().length < 3) {
      setErrors({ reason: "Indica el motivo de la corrección." });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
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
          setSubmitError(data?.error?.message ?? "No se pudo guardar la corrección.");
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
        setSubmitError("Comprobando… un momento.");
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
            message:
              data?.error?.message ??
              "No hemos podido generar el documento. Tus datos siguen guardados. Reintenta en unos segundos.",
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
        setSubmitError(data?.error?.message ?? "No se pudo generar el DeCA. Inténtalo de nuevo.");
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
      setFailure({ message: "Sin conexión. Revisa tu red e inténtalo de nuevo." });
      setSubmitting(false);
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  }

  const errorList = Object.entries(errors);

  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        Paso {step + 1} de 3 · <span className="text-[var(--color-text)]">{STEP_LABELS[step]}</span>
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-label={`Paso ${step + 1} de 3: ${STEP_LABELS[step]}`}
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
        {STEP_LABELS[step]}
      </h1>
      {isCorrection ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Corrigiendo el DeCA. Se generará una nueva versión con un QR y una URL nuevos; la versión
          anterior se conserva.
        </p>
      ) : (
        needsAuth && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Completa los datos sin compromiso — te pediremos crear una cuenta gratuita solo al
            final, para generar el documento.
          </p>
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
          <p className="font-bold text-[var(--color-danger)]">Revisa estos campos:</p>
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
                <span className="font-medium">Empezar desde una plantilla</span>
                <select
                  data-testid="template-picker"
                  className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const t = templates.find((x) => x.id === e.target.value);
                    if (t)
                      setForm((f) => ({
                        ...f,
                        shipperName: t.shipper?.name || f.shipperName,
                        shipperNif: t.shipper?.nif || f.shipperNif,
                        shipperAddress: t.shipper?.address || f.shipperAddress,
                        carrierName: t.carrier?.name || f.carrierName,
                        carrierNif: t.carrier?.nif || f.carrierNif,
                        carrierAddress: t.carrier?.address || f.carrierAddress,
                        loadLocationName: t.loadLocation?.name || f.loadLocationName,
                        loadLocationAddress: t.loadLocation?.address || f.loadLocationAddress,
                        loadLocationPostalCode:
                          t.loadLocation?.postalCode || f.loadLocationPostalCode,
                        loadLocationCity: t.loadLocation?.city || f.loadLocationCity,
                        loadLocationProvince: t.loadLocation?.province || f.loadLocationProvince,
                        loadLocationCountry: t.loadLocation?.country || f.loadLocationCountry,
                        unloadLocationName: t.unloadLocation?.name || f.unloadLocationName,
                        unloadLocationAddress: t.unloadLocation?.address || f.unloadLocationAddress,
                        unloadLocationPostalCode:
                          t.unloadLocation?.postalCode || f.unloadLocationPostalCode,
                        unloadLocationCity: t.unloadLocation?.city || f.unloadLocationCity,
                        unloadLocationProvince:
                          t.unloadLocation?.province || f.unloadLocationProvince,
                        unloadLocationCountry: t.unloadLocation?.country || f.unloadLocationCountry,
                        goods: t.goods || f.goods,
                        weight: t.weight || f.weight,
                        tractorPlate: t.tractorPlate || f.tractorPlate,
                        trailerPlate: t.trailerPlate || f.trailerPlate,
                      }));
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">Elige una plantilla…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Aún tendrás que revisar los datos y poner la fecha antes de generar.
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
                  Mi empresa es el cargador
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
                  Mi empresa es el transportista
                </button>
              </div>
            )}
            {saved && saved.companies.length > 0 && (
              <label className="mt-4 block text-sm">
                <span className="font-medium">Usar una empresa guardada</span>
                <select
                  data-testid="autofill-company"
                  className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const c = saved.companies.find((x) => x.id === e.target.value);
                    if (c)
                      setForm((f) => ({
                        ...f,
                        carrierName: c.name,
                        carrierNif: c.nif ?? "",
                        carrierAddress: c.address ?? f.carrierAddress,
                      }));
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">Rellenar transportista con…</option>
                  {saved.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.nif ? ` — ${c.nif}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">Empresa que contrata el transporte</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                ¿Quién te ha contratado este transporte?
              </p>
              <Field
                id="shipperName"
                label="Nombre o razón social"
                value={form.shipperName}
                onChange={set("shipperName")}
                error={errors.shipperName}
                autoComplete="organization"
              />
              <Field
                id="shipperNif"
                label="NIF / VAT"
                value={form.shipperNif}
                onChange={set("shipperNif")}
                error={errors.shipperNif}
                hint="Puedes usar un NIF/VAT extranjero."
              />
              <Field
                id="shipperAddress"
                label="Domicilio"
                value={form.shipperAddress}
                onChange={set("shipperAddress")}
                error={errors.shipperAddress}
                autoComplete="street-address"
              />
            </fieldset>
            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">
                Transportista que realiza el transporte
              </legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                ¿Qué empresa realiza físicamente el transporte?
              </p>
              <Field
                id="carrierName"
                label="Nombre o razón social"
                value={form.carrierName}
                onChange={set("carrierName")}
                error={errors.carrierName}
                autoComplete="organization"
              />
              <Field
                id="carrierNif"
                label="NIF / VAT"
                value={form.carrierNif}
                onChange={set("carrierNif")}
                error={errors.carrierNif}
                hint="Puedes usar un NIF/VAT extranjero."
              />
              <Field
                id="carrierAddress"
                label="Domicilio"
                value={form.carrierAddress}
                onChange={set("carrierAddress")}
                error={errors.carrierAddress}
                autoComplete="street-address"
              />
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">Lugar de carga</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                Dónde se recoge la mercancía y qué día.
              </p>
              <Field
                id="loadLocationName"
                label="Empresa o establecimiento"
                value={form.loadLocationName}
                onChange={set("loadLocationName")}
                error={errors.loadLocationName}
                autoComplete="organization"
              />
              <Field
                id="loadLocationAddress"
                label="Dirección completa"
                value={form.loadLocationAddress}
                onChange={set("loadLocationAddress")}
                error={errors.loadLocationAddress}
                autoComplete="street-address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="loadLocationPostalCode"
                  label="Código postal"
                  value={form.loadLocationPostalCode}
                  onChange={set("loadLocationPostalCode")}
                  error={errors.loadLocationPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="loadLocationCity"
                  label="Localidad"
                  value={form.loadLocationCity}
                  onChange={set("loadLocationCity")}
                  error={errors.loadLocationCity}
                  autoComplete="address-level2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="loadLocationProvince"
                  label="Provincia"
                  value={form.loadLocationProvince}
                  onChange={set("loadLocationProvince")}
                  error={errors.loadLocationProvince}
                  autoComplete="address-level1"
                />
                <Field
                  id="loadLocationCountry"
                  label="País"
                  value={form.loadLocationCountry}
                  onChange={set("loadLocationCountry")}
                  error={errors.loadLocationCountry}
                  autoComplete="country-name"
                />
              </div>
              <Field
                id="loadDate"
                label="Fecha de carga"
                type="date"
                value={form.loadDate}
                onChange={set("loadDate")}
                error={errors.loadDate}
              />
            </fieldset>

            <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <legend className="px-1 text-sm font-bold">Lugar de descarga</legend>
              <p className="text-xs text-[var(--color-text-muted)]">
                Dónde se entrega la mercancía y qué día. Puede ser el mismo día que la carga.
              </p>
              <Field
                id="unloadLocationName"
                label="Empresa o establecimiento"
                value={form.unloadLocationName}
                onChange={set("unloadLocationName")}
                error={errors.unloadLocationName}
                autoComplete="organization"
              />
              <Field
                id="unloadLocationAddress"
                label="Dirección completa"
                value={form.unloadLocationAddress}
                onChange={set("unloadLocationAddress")}
                error={errors.unloadLocationAddress}
                autoComplete="street-address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="unloadLocationPostalCode"
                  label="Código postal"
                  value={form.unloadLocationPostalCode}
                  onChange={set("unloadLocationPostalCode")}
                  error={errors.unloadLocationPostalCode}
                  autoComplete="postal-code"
                />
                <Field
                  id="unloadLocationCity"
                  label="Localidad"
                  value={form.unloadLocationCity}
                  onChange={set("unloadLocationCity")}
                  error={errors.unloadLocationCity}
                  autoComplete="address-level2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="unloadLocationProvince"
                  label="Provincia"
                  value={form.unloadLocationProvince}
                  onChange={set("unloadLocationProvince")}
                  error={errors.unloadLocationProvince}
                  autoComplete="address-level1"
                />
                <Field
                  id="unloadLocationCountry"
                  label="País"
                  value={form.unloadLocationCountry}
                  onChange={set("unloadLocationCountry")}
                  error={errors.unloadLocationCountry}
                  autoComplete="country-name"
                />
              </div>
              <Field
                id="unloadDate"
                label="Fecha de descarga"
                type="date"
                value={form.unloadDate}
                onChange={set("unloadDate")}
                error={errors.unloadDate}
                hint="Puede coincidir con la fecha de carga."
              />
            </fieldset>
          </>
        )}

        {step === 2 && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">Vehículo y mercancía</legend>
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">
              El vehículo que hace el porte y qué se transporta.
            </p>
            {saved && saved.vehicles.length > 0 && (
              <label className="block text-sm">
                <span className="font-medium">Usar un vehículo guardado</span>
                <select
                  data-testid="autofill-vehicle"
                  className="mt-1 mb-2 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                  defaultValue=""
                  onChange={(e) => {
                    const v = saved.vehicles.find((x) => x.id === e.target.value);
                    if (v)
                      setForm((f) => ({
                        ...f,
                        tractorPlate: v.tractorPlate,
                        trailerPlate: v.trailerPlate ?? "",
                      }));
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="">Rellenar matrículas con…</option>
                  {saved.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.tractorPlate}
                      {v.trailerPlate ? ` + ${v.trailerPlate}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Field
              id="goods"
              label="Naturaleza de la mercancía"
              value={form.goods}
              onChange={set("goods")}
              error={errors.goods}
            />
            <Field
              id="weight"
              label="Peso (o medida alternativa)"
              value={form.weight}
              onChange={set("weight")}
              error={errors.weight}
              hint="Ej.: 12000 kg, o «una plataforma completa» si el peso exacto no es determinable."
            />
            <Field
              id="tractorPlate"
              label="Matrícula de la tractora"
              value={form.tractorPlate}
              onChange={set("tractorPlate")}
              error={errors.tractorPlate}
              hint={plateHint}
            />
            <Field
              id="trailerPlate"
              label="Matrícula del remolque / semirremolque"
              value={form.trailerPlate}
              onChange={set("trailerPlate")}
              error={errors.trailerPlate}
              required={false}
              hint="Si no hay remolque, déjalo vacío."
            />
            <Field
              id="reference"
              label="Referencia o notas (opcional)"
              value={form.reference}
              onChange={set("reference")}
              error={errors.reference}
              required={false}
            />
            {needsAuth && (
              <div
                data-testid="auth-gate"
                className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-soft,#eef4ff)] p-4"
              >
                <p className="font-bold text-[var(--color-primary)]">
                  Crea tu cuenta gratuita para generar el DeCA
                </p>
                <p className="mt-1 text-sm">
                  Tus datos están guardados en este paso. Regístrate o inicia sesión y generamos tu
                  documento al instante, sin volver a escribir nada.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/registro?next=%2Fcrear"
                    data-testid="auth-gate-register"
                    className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 font-medium text-[var(--color-primary-contrast)] no-underline"
                  >
                    Crear cuenta gratis
                  </Link>
                  <Link
                    href="/entrar?next=%2Fcrear"
                    data-testid="auth-gate-login"
                    className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 py-2.5 font-medium text-[var(--color-primary)] no-underline"
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            )}
            {needsVerification && (
              <div
                data-testid="verify-gate"
                className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-soft,#eef4ff)] p-4"
              >
                <p className="font-bold text-[var(--color-primary)]">
                  Verifica tu correo para generar el DeCA
                </p>
                <p className="mt-1 text-sm">
                  Tus datos están guardados en este paso. Confirma el enlace que te enviamos por
                  email y vuelve — generamos tu documento al instante, sin volver a escribir nada.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/verificar-email?next=%2Fcrear"
                    data-testid="verify-gate-link"
                    className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 font-medium text-[var(--color-primary-contrast)] no-underline"
                  >
                    Ir a verificar mi correo
                  </Link>
                </div>
              </div>
            )}
            {isCorrection && (
              <div className="mt-3">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Motivo de la corrección *
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
            Estamos generando tu PDF y QR… no cierres esta página.
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
            <p className="font-medium text-[var(--color-danger)]">No se ha generado el DeCA</p>
            <p className="mt-1 text-sm">{failure.message}</p>
            {failure.correlationId && (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Código: <strong data-testid="failure-code">{failure.correlationId}</strong> —
                dínoslo si vuelve a ocurrir y localizaremos el fallo exacto.
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
                {submitting ? "Generando…" : "Reintentar generación"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFailure(null);
                  setStep(0);
                }}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-medium"
              >
                Volver a revisar datos
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
              Atrás
            </button>
          )}
          {!(step === 2 && (needsAuth || needsVerification)) && (
            <button
              type="submit"
              disabled={submitting}
              data-testid={step < 2 ? "wizard-next" : "wizard-generate"}
              className="min-h-12 flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-55"
            >
              {step < 2
                ? "Siguiente"
                : submitting
                  ? "Generando…"
                  : isCorrection
                    ? "GUARDAR CORRECCIÓN"
                    : "GENERAR DECA"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
