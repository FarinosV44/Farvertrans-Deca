"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/deca/field";
import { BuildingIcon, TruckIcon, MapPinIcon, IconBadge } from "@/components/panel/icons";

type Company = {
  id: string;
  name: string;
  nif: string | null;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  role: "shipper" | "carrier" | "both";
};
type Vehicle = {
  id: string;
  tractorPlate: string;
  trailerPlate: string | null;
  alias: string | null;
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
};

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
  // Bumped on every successful add and used as each form's `key`, so it
  // remounts with blank fields instead of showing the just-saved values.
  const [formVersion, setFormVersion] = useState(0);

  async function add(kind: string, body: Record<string, string>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/saved/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError("No se pudo guardar. Revisa los datos.");
        setBusy(false);
        return;
      }
      setFormVersion((v) => v + 1);
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
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

      <Section
        title="Empresas y contactos"
        Icon={BuildingIcon}
        items={companies.map((c) => ({
          id: c.id,
          primary: c.name,
          secondary: [
            ROLE_LABEL[c.role],
            c.nif,
            c.address,
            c.contactName ? `Contacto: ${c.contactName}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        }))}
        onRemove={(id) => remove("company", id)}
        busy={busy}
        form={<CompanyForm key={formVersion} onSubmit={(b) => add("company", b)} busy={busy} />}
      />
      <Section
        title="Vehículos"
        Icon={TruckIcon}
        items={vehicles.map((v) => ({
          id: v.id,
          primary: v.alias || v.tractorPlate,
          secondary: [
            v.alias ? v.tractorPlate : null,
            v.trailerPlate ? `Remolque ${v.trailerPlate}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        }))}
        onRemove={(id) => remove("vehicle", id)}
        busy={busy}
        form={<VehicleForm key={formVersion} onSubmit={(b) => add("vehicle", b)} busy={busy} />}
      />
      <Section
        title="Lugares de carga y descarga"
        Icon={MapPinIcon}
        items={locations.map((l) => ({
          id: l.id,
          primary: l.name,
          secondary: [
            LOCATION_TYPE_LABEL[l.type],
            [l.address, l.postalCode, l.city, l.province, l.country].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" · "),
        }))}
        onRemove={(id) => remove("location", id)}
        busy={busy}
        form={<LocationForm key={formVersion} onSubmit={(b) => add("location", b)} busy={busy} />}
      />

      <p className="text-xs text-[var(--color-text-muted)]">
        Editar o borrar un dato habitual no cambia ningún DeCA ya generado: cada documento guarda su
        propia copia.
      </p>
    </div>
  );
}

function Section({
  title,
  Icon,
  items,
  onRemove,
  busy,
  form,
}: {
  title: string;
  Icon: (props: { width?: number; height?: number }) => React.JSX.Element;
  items: { id: string; primary: string; secondary: string }[];
  onRemove: (id: string) => void;
  busy: boolean;
  form: React.ReactNode;
}) {
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
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
            >
              <span>
                <span className="font-medium">{it.primary}</span>
                {it.secondary && (
                  <span className="text-[var(--color-text-muted)]"> — {it.secondary}</span>
                )}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRemove(it.id)}
                className="text-sm text-[var(--color-danger)] underline disabled:opacity-55"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nada guardado todavía.</p>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
          Añadir
        </summary>
        {form}
      </details>
    </section>
  );
}

function CompanyForm({
  onSubmit,
  busy,
}: {
  onSubmit: (b: Record<string, string>) => void;
  busy: boolean;
}) {
  const [f, setF] = useState({
    name: "",
    nif: "",
    address: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    role: "both",
  });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
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
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="c-nif"
        label="NIF"
        value={f.nif}
        onChange={(v) => setF((s) => ({ ...s, nif: v }))}
      />
      <Field
        id="c-address"
        label="Domicilio"
        value={f.address}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
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
  onSubmit,
  busy,
}: {
  onSubmit: (b: Record<string, string>) => void;
  busy: boolean;
}) {
  const [f, setF] = useState({ tractorPlate: "", trailerPlate: "", alias: "" });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
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
  onSubmit,
  busy,
}: {
  onSubmit: (b: Record<string, string>) => void;
  busy: boolean;
}) {
  const [f, setF] = useState({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
    country: "España",
    type: "both",
  });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
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
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="l-address"
        label="Dirección"
        value={f.address}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
      />
      <Field
        id="l-postal-code"
        label="Código postal"
        value={f.postalCode}
        onChange={(v) => setF((s) => ({ ...s, postalCode: v }))}
      />
      <Field
        id="l-city"
        label="Localidad"
        value={f.city}
        onChange={(v) => setF((s) => ({ ...s, city: v }))}
      />
      <Field
        id="l-province"
        label="Provincia"
        value={f.province}
        onChange={(v) => setF((s) => ({ ...s, province: v }))}
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
function FormWrap({
  children,
  onSubmit,
  busy,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <form
      className="mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      {children}
      <button
        type="submit"
        disabled={busy}
        className="mt-3 min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        Guardar
      </button>
    </form>
  );
}
