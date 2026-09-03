"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  origin: string;
  destination: string;
  transportDate: string;
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
  origin: "",
  destination: "",
  transportDate: "",
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
};

export type SavedData = {
  companies: { id: string; name: string; nif: string | null; address: string | null }[];
  vehicles: { id: string; tractorPlate: string; trailerPlate: string | null }[];
  addresses: { id: string; label: string; address: string }[];
};

/** Pre-fill for the duplicate flow (a source DeCA's payload, date left blank). */
export type WizardInitial = Partial<FormState>;

function toPayload(f: FormState) {
  return {
    shipper: { name: f.shipperName, nif: f.shipperNif, address: f.shipperAddress },
    carrier: { name: f.carrierName, nif: f.carrierNif, address: f.carrierAddress },
    origin: f.origin,
    destination: f.destination,
    transportDate: f.transportDate,
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
 */
function ReviewSummary({ form }: { form: FormState }) {
  const rows: [string, string][] = [
    ["Cargador contractual", form.shipperName],
    ["NIF del cargador", form.shipperNif],
    ["Domicilio del cargador", form.shipperAddress],
    ["Transportista efectivo", form.carrierName],
    ["NIF del transportista", form.carrierNif],
    ["Domicilio del transportista", form.carrierAddress],
    ["Origen", form.origin],
    ["Destino", form.destination],
    ["Fecha del transporte", form.transportDate],
    ["Mercancía", form.goods],
    ["Peso o medida", form.weight],
    ["Matrícula tractora", form.tractorPlate],
    ["Matrícula remolque", form.trailerPlate || "—"],
    ...(form.reference ? ([["Referencia", form.reference]] as [string, string][]) : []),
  ];
  return (
    <section
      data-testid="review-summary"
      aria-labelledby="review-summary-h"
      className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <h2 id="review-summary-h" className="text-sm font-bold">
        Revisa antes de generar
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Estos son los datos exactos que aparecerán en el DeCA y en el PDF.
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-xs font-medium text-[var(--color-text-muted)]">{k}</dt>
            <dd className="text-sm break-words">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CrearWizard({
  initial,
  saved,
  correctDecaId,
}: {
  initial?: WizardInitial;
  saved?: SavedData;
  /** When set, the wizard corrects an existing DeCA → a new version (R-13). */
  correctDecaId?: string;
} = {}) {
  const router = useRouter();
  const isCorrection = !!correctDecaId;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
    [],
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
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
          ? { origin: p.origin, destination: p.destination, transportDate: p.transportDate }
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
    for (const i of r.error.issues) {
      const path = i.path.join(".");
      flat[FIELD_KEY_MAP[path] ?? path] = i.message;
    }
    setErrors(flat);
    requestAnimationFrame(() => summaryRef.current?.focus());
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
    if (!validateStep() || submitting) return;
    if (isCorrection && reason.trim().length < 3) {
      setErrors({ reason: "Indica el motivo de la corrección." });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
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
      const q = data.claimToken ? `?claim=${encodeURIComponent(data.claimToken)}` : "";
      router.push(`/crear/${data.decaId}${q}`);
    } catch {
      setSubmitError("Sin conexión. Revisa tu red e inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  const errorList = Object.entries(errors);

  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Paso {step + 1} de 3</p>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-label={`Paso ${step + 1} de 3`}
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
        {["Cargador y transportista", "Origen, destino y fecha", "Mercancía y vehículo"][step]}
      </h1>
      {isCorrection ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Corrigiendo el DeCA. Se generará una nueva versión con un QR y una URL nuevos; la versión
          anterior se conserva.
        </p>
      ) : (
        !saved && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            No necesitas registrarte para crear tu primer DeCA.
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
              <legend className="px-1 text-sm font-bold">Cargador contractual</legend>
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
                label="NIF"
                value={form.shipperNif}
                onChange={set("shipperNif")}
                error={errors.shipperNif}
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
              <legend className="px-1 text-sm font-bold">Transportista efectivo</legend>
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
                label="NIF"
                value={form.carrierNif}
                onChange={set("carrierNif")}
                error={errors.carrierNif}
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
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">Trayecto</legend>
            <Field
              id="origin"
              label="Lugar de origen"
              value={form.origin}
              onChange={set("origin")}
              error={errors.origin}
            />
            <Field
              id="destination"
              label="Lugar de destino"
              value={form.destination}
              onChange={set("destination")}
              error={errors.destination}
            />
            <Field
              id="transportDate"
              label="Fecha del transporte"
              type="date"
              value={form.transportDate}
              onChange={set("transportDate")}
              error={errors.transportDate}
            />
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">Mercancía y vehículo</legend>
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
              hint="Solo si es un conjunto articulado."
            />
            <Field
              id="reference"
              label="Referencia o notas (opcional)"
              value={form.reference}
              onChange={set("reference")}
              error={errors.reference}
              required={false}
            />
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

        {step === 2 && !isCorrection && <ReviewSummary form={form} />}

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 font-medium text-[var(--color-primary)]"
            >
              Atrás
            </button>
          )}
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
        </div>
      </form>
    </div>
  );
}
