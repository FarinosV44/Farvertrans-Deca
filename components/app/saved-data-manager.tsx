"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/deca/field";
import { BuildingIcon, TruckIcon, MapPinIcon, IconBadge } from "@/components/panel/icons";

type Company = { id: string; name: string; nif: string | null; address: string | null };
type Vehicle = { id: string; tractorPlate: string; trailerPlate: string | null };
type Address = { id: string; label: string; address: string };

export function SavedDataManager({
  companies,
  vehicles,
  addresses,
}: {
  companies: Company[];
  vehicles: Vehicle[];
  addresses: Address[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        title="Empresas / transportistas"
        Icon={BuildingIcon}
        items={companies.map((c) => ({
          id: c.id,
          primary: c.name,
          secondary: `${c.nif}${c.address ? " · " + c.address : ""}`,
        }))}
        onRemove={(id) => remove("company", id)}
        busy={busy}
        form={<CompanyForm onSubmit={(b) => add("company", b)} busy={busy} />}
      />
      <Section
        title="Vehículos"
        Icon={TruckIcon}
        items={vehicles.map((v) => ({
          id: v.id,
          primary: v.tractorPlate,
          secondary: v.trailerPlate ? `Remolque ${v.trailerPlate}` : "",
        }))}
        onRemove={(id) => remove("vehicle", id)}
        busy={busy}
        form={<VehicleForm onSubmit={(b) => add("vehicle", b)} busy={busy} />}
      />
      <Section
        title="Direcciones"
        Icon={MapPinIcon}
        items={addresses.map((a) => ({ id: a.id, primary: a.label, secondary: a.address }))}
        onRemove={(id) => remove("address", id)}
        busy={busy}
        form={<AddressForm onSubmit={(b) => add("address", b)} busy={busy} />}
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
  const [f, setF] = useState({ name: "", nif: "", address: "" });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
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
        label="Domicilio (opcional)"
        required={false}
        value={f.address}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
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
  const [f, setF] = useState({ tractorPlate: "", trailerPlate: "" });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
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
function AddressForm({
  onSubmit,
  busy,
}: {
  onSubmit: (b: Record<string, string>) => void;
  busy: boolean;
}) {
  const [f, setF] = useState({ label: "", address: "" });
  return (
    <FormWrap busy={busy} onSubmit={() => onSubmit(f)}>
      <Field
        id="a-label"
        label="Etiqueta (p. ej. «Almacén Valencia»)"
        value={f.label}
        onChange={(v) => setF((s) => ({ ...s, label: v }))}
      />
      <Field
        id="a-address"
        label="Dirección"
        value={f.address}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
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
