"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/deca/field";
import { FavoriteStar } from "@/components/deca/favorite-star";
import { BuildingIcon, TruckIcon, MapPinIcon, IconBadge } from "@/components/panel/icons";

type Company = {
  id: string;
  name: string;
  nif: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  role: "shipper" | "carrier" | "both";
  favorite: boolean;
};
type Vehicle = {
  id: string;
  tractorPlate: string;
  trailerPlate: string | null;
  alias: string | null;
  favorite: boolean;
};
type Location = {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string;
  type: "load" | "unload" | "both";
  favorite: boolean;
};
type SavedKind = "company" | "vehicle" | "location";

const ROLE_LABEL: Record<Company["role"], string> = {
  shipper: "Cargador contractual",
  carrier: "Transportista efectivo",
  both: "Cargador y transportista",
};
const LOCATION_TYPE_LABEL: Record<Location["type"], string> = {
  load: "Carga",
  unload: "Descarga",
  both: "Carga y descarga",
};

type FieldErrors = Record<string, string[] | undefined>;
type SaveResult = { ok: boolean; fields?: FieldErrors };
type Body = Record<string, string>;
/** A form calls this on submit; the parent resolves the promise with the outcome. */
type OnSubmit = (body: Body) => Promise<SaveResult>;

const err1 = (e: FieldErrors | undefined, k: string) => e?.[k]?.[0];

export function SavedDataManager({
  companies,
  vehicles,
  locations,
}: {
  companies: Company[];
  vehicles: Vehicle[];
  locations: Location[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create (no `id`) or edit (`id`) a saved record (#86 part 1). A 422 hands
   * the per-field zod messages back to the form so the user sees the exact
   * missing field, not a generic "revisa los datos".
   */
  async function save(kind: string, body: Body, id?: string): Promise<SaveResult> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(id ? `/api/saved/${kind}/${id}` : `/api/saved/${kind}`, {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fields = data?.error?.fields as FieldErrors | undefined;
        if (!fields) setError("No se pudo guardar. Revisa los datos.");
        setBusy(false);
        return { ok: false, fields };
      }
      router.refresh();
      setBusy(false);
      return { ok: true };
    } catch {
      setError("Sin conexión.");
      setBusy(false);
      return { ok: false };
    }
  }

  async function remove(kind: string, id: string) {
    setBusy(true);
    await fetch(`/api/saved/${kind}/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="mt-6 space-y-10">
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <Section<Company>
        title="Empresas y contactos"
        Icon={BuildingIcon}
        kind="company"
        items={companies}
        busy={busy}
        save={save}
        remove={remove}
        primary={(c) => c.name}
        secondary={(c) =>
          [
            ROLE_LABEL[c.role],
            c.nif,
            [c.address, [c.postalCode, c.city].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", "),
            c.contactName ? `Contacto: ${c.contactName}` : null,
          ]
            .filter(Boolean)
            .join(" · ")
        }
        renderForm={(props) => <CompanyForm {...props} />}
      />
      <Section<Vehicle>
        title="Vehículos"
        Icon={TruckIcon}
        kind="vehicle"
        items={vehicles}
        busy={busy}
        save={save}
        remove={remove}
        primary={(v) => v.alias || v.tractorPlate}
        secondary={(v) =>
          [v.alias ? v.tractorPlate : null, v.trailerPlate ? `Remolque ${v.trailerPlate}` : null]
            .filter(Boolean)
            .join(" · ")
        }
        renderForm={(props) => <VehicleForm {...props} />}
      />
      <Section<Location>
        title="Lugares de carga y descarga"
        Icon={MapPinIcon}
        kind="location"
        items={locations}
        busy={busy}
        save={save}
        remove={remove}
        primary={(l) => l.name}
        secondary={(l) =>
          [
            LOCATION_TYPE_LABEL[l.type],
            [l.address, l.postalCode, l.city, l.province, l.country].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" · ")
        }
        renderForm={(props) => <LocationForm {...props} />}
      />

      <p className="text-xs text-[var(--color-text-muted)]">
        Editar o borrar un dato habitual no cambia ningún DeCA ya generado: cada documento guarda su
        propia copia.
      </p>
    </div>
  );
}

type FormProps<T> = {
  initial?: T;
  submitLabel: string;
  fieldErrors: FieldErrors;
  busy: boolean;
  onSubmit: OnSubmit;
  onCancel?: () => void;
};

function Section<T extends { id: string; favorite: boolean }>({
  title,
  Icon,
  kind,
  items,
  busy,
  save,
  remove,
  primary,
  secondary,
  renderForm,
}: {
  title: string;
  Icon: (props: { width?: number; height?: number }) => React.JSX.Element;
  kind: SavedKind;
  items: T[];
  busy: boolean;
  save: (kind: string, body: Body, id?: string) => Promise<SaveResult>;
  remove: (kind: string, id: string) => void;
  primary: (t: T) => string;
  secondary: (t: T) => string;
  renderForm: (props: FormProps<T>) => React.ReactNode;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [addErrors, setAddErrors] = useState<FieldErrors>({});
  // Remount the add form after a successful add so it clears.
  const [addKey, setAddKey] = useState(0);

  const doSave =
    (id: string | undefined, setErrs: (e: FieldErrors) => void): OnSubmit =>
    async (body) => {
      const r = await save(kind, body, id);
      setErrs(r.fields ?? {});
      if (r.ok) {
        if (id) setEditingId(null);
        else setAddKey((k) => k + 1);
      }
      return r;
    };

  return (
    <section aria-labelledby={`sec-${title}`}>
      <h2 id={`sec-${title}`} className="flex items-center gap-2 text-lg font-bold">
        <IconBadge size={32}>
          <Icon width={16} height={16} />
        </IconBadge>
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((it) => {
            const isEditing = editingId === it.id;
            return (
              <li
                key={it.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2">
                    <FavoriteStar
                      favorite={it.favorite}
                      payload={{ kind, id: it.id }}
                      label={primary(it)}
                    />
                    <span className="min-w-0">
                      <span className="font-medium">{primary(it)}</span>
                      {secondary(it) && (
                        <span className="text-[var(--color-text-muted)]"> — {secondary(it)}</span>
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      data-testid={`edit-${kind}`}
                      onClick={() => {
                        setEditErrors({});
                        setEditingId(isEditing ? null : it.id);
                      }}
                      className="text-sm text-[var(--color-primary)] underline disabled:opacity-55"
                    >
                      {isEditing ? "Cerrar" : "Editar"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(kind, it.id)}
                      className="text-sm text-[var(--color-danger)] underline disabled:opacity-55"
                    >
                      Borrar
                    </button>
                  </span>
                </div>
                {isEditing && (
                  <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                    {renderForm({
                      initial: it,
                      submitLabel: "Guardar cambios",
                      fieldErrors: editErrors,
                      busy,
                      onSubmit: doSave(it.id, setEditErrors),
                      onCancel: () => setEditingId(null),
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nada guardado todavía.</p>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
          Añadir
        </summary>
        <div key={addKey}>
          {renderForm({
            submitLabel: "Guardar",
            fieldErrors: addErrors,
            busy,
            onSubmit: doSave(undefined, setAddErrors),
          })}
        </div>
      </details>
    </section>
  );
}

function FormWrap({
  children,
  onSubmit,
  onCancel,
  busy,
  submitLabel,
}: {
  children: React.ReactNode;
  onSubmit: () => Promise<SaveResult>;
  onCancel?: () => void;
  busy: boolean;
  submitLabel: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        await onSubmit();
        setSubmitting(false);
      }}
      noValidate
    >
      {children}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={busy || submitting}
          className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function CompanyForm({
  initial,
  submitLabel,
  fieldErrors,
  busy,
  onSubmit,
  onCancel,
}: FormProps<Company>) {
  const [f, setF] = useState<Body>({
    name: initial?.name ?? "",
    nif: initial?.nif ?? "",
    address: initial?.address ?? "",
    postalCode: initial?.postalCode ?? "",
    city: initial?.city ?? "",
    contactName: initial?.contactName ?? "",
    contactPhone: initial?.contactPhone ?? "",
    contactEmail: initial?.contactEmail ?? "",
    role: initial?.role ?? "both",
  });
  return (
    <FormWrap
      busy={busy}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={() => onSubmit(f)}
    >
      <label className="mt-3 block text-sm">
        <span className="font-medium">Rol habitual</span>
        <select
          data-testid="c-role"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.role}
          onChange={(e) => setF((s) => ({ ...s, role: e.target.value }))}
        >
          <option value="both">Cargador y transportista</option>
          <option value="shipper">Cargador contractual</option>
          <option value="carrier">Transportista efectivo</option>
        </select>
      </label>
      <Field
        id="c-name"
        label="Nombre o razón social"
        value={f.name}
        error={err1(fieldErrors, "name")}
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="c-nif"
        label="NIF"
        value={f.nif}
        error={err1(fieldErrors, "nif")}
        onChange={(v) => setF((s) => ({ ...s, nif: v }))}
      />
      <Field
        id="c-address"
        label="Domicilio"
        value={f.address}
        error={err1(fieldErrors, "address")}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
      />
      <Field
        id="c-postal-code"
        label="Código postal"
        value={f.postalCode}
        error={err1(fieldErrors, "postalCode")}
        onChange={(v) => setF((s) => ({ ...s, postalCode: v }))}
      />
      <Field
        id="c-city"
        label="Población / localidad"
        value={f.city}
        error={err1(fieldErrors, "city")}
        onChange={(v) => setF((s) => ({ ...s, city: v }))}
      />
      <Field
        id="c-contact-name"
        label="Persona de contacto (opcional)"
        required={false}
        value={f.contactName}
        onChange={(v) => setF((s) => ({ ...s, contactName: v }))}
      />
      <Field
        id="c-contact-phone"
        label="Teléfono de contacto (opcional)"
        required={false}
        value={f.contactPhone}
        onChange={(v) => setF((s) => ({ ...s, contactPhone: v }))}
      />
      <Field
        id="c-contact-email"
        label="Email de contacto (opcional)"
        required={false}
        type="email"
        value={f.contactEmail}
        onChange={(v) => setF((s) => ({ ...s, contactEmail: v }))}
      />
    </FormWrap>
  );
}

function VehicleForm({
  initial,
  submitLabel,
  fieldErrors,
  busy,
  onSubmit,
  onCancel,
}: FormProps<Vehicle>) {
  const [f, setF] = useState({
    tractorPlate: initial?.tractorPlate ?? "",
    trailerPlate: initial?.trailerPlate ?? "",
    alias: initial?.alias ?? "",
  });
  return (
    <FormWrap
      busy={busy}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={() => onSubmit(f)}
    >
      <Field
        id="v-alias"
        label="Alias (opcional, p. ej. «Camión 1»)"
        required={false}
        value={f.alias}
        onChange={(v) => setF((s) => ({ ...s, alias: v }))}
      />
      <Field
        id="v-tractor"
        label="Matrícula tractora"
        value={f.tractorPlate}
        error={err1(fieldErrors, "tractorPlate")}
        onChange={(v) => setF((s) => ({ ...s, tractorPlate: v }))}
      />
      <Field
        id="v-trailer"
        label="Matrícula remolque (opcional)"
        required={false}
        value={f.trailerPlate}
        onChange={(v) => setF((s) => ({ ...s, trailerPlate: v }))}
      />
    </FormWrap>
  );
}

function LocationForm({
  initial,
  submitLabel,
  fieldErrors,
  busy,
  onSubmit,
  onCancel,
}: FormProps<Location>) {
  const [f, setF] = useState<Body>({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    postalCode: initial?.postalCode ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    country: initial?.country ?? "España",
    type: initial?.type ?? "both",
  });
  return (
    <FormWrap
      busy={busy}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={() => onSubmit(f)}
    >
      <label className="mt-3 block text-sm">
        <span className="font-medium">Uso habitual</span>
        <select
          data-testid="l-type"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.type}
          onChange={(e) => setF((s) => ({ ...s, type: e.target.value }))}
        >
          <option value="both">Carga y descarga</option>
          <option value="load">Solo carga</option>
          <option value="unload">Solo descarga</option>
        </select>
      </label>
      <Field
        id="l-name"
        label="Empresa / establecimiento"
        value={f.name}
        error={err1(fieldErrors, "name")}
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="l-address"
        label="Dirección"
        value={f.address}
        error={err1(fieldErrors, "address")}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
      />
      <Field
        id="l-postal-code"
        label="Código postal"
        value={f.postalCode}
        error={err1(fieldErrors, "postalCode")}
        onChange={(v) => setF((s) => ({ ...s, postalCode: v }))}
      />
      <Field
        id="l-city"
        label="Localidad"
        value={f.city}
        error={err1(fieldErrors, "city")}
        onChange={(v) => setF((s) => ({ ...s, city: v }))}
      />
      <Field
        id="l-province"
        label="Provincia"
        value={f.province}
        onChange={(v) => setF((s) => ({ ...s, province: v }))}
        required={false}
      />
      <Field
        id="l-country"
        label="País"
        value={f.country}
        onChange={(v) => setF((s) => ({ ...s, country: v }))}
      />
    </FormWrap>
  );
}
