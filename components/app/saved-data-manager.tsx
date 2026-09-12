"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { FavoriteStar } from "@/components/deca/favorite-star";
import { Modal } from "@/components/app/modal";
import { BuildingIcon, TruckIcon, MapPinIcon, RouteIcon } from "@/components/panel/icons";
import { savedShipmentLabel, type SavedShipmentOption } from "@/components/deca/wizard";
import {
  findDuplicateCompany,
  findDuplicateLocation,
  findDuplicateShipment,
  findDuplicateVehicle,
} from "@/lib/data/saved-dedup";
import { useT } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/dictionaries/es";

type DatosMessages = Messages["panel"]["datos"];

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
/** #113 Phase 2 — a "ruta/envío habitual" row, the same shape `listSavedShipments()`
 *  (lib/data/saved-shipments.ts) returns; `SavedShipmentOption` (wizard.tsx) is the
 *  subset the picker needs, reused here rather than redefined. */
type Shipment = SavedShipmentOption & { favorite: boolean };

type SavedKind = "company" | "vehicle" | "location" | "shipment";

type FieldErrors = Record<string, string[] | undefined>;
type SaveResult = { ok: boolean; fields?: FieldErrors };
type Body = Record<string, string>;
/** A form calls this on submit; the parent resolves the promise with the outcome. */
type OnSubmit = (body: Body) => Promise<SaveResult>;

const err1 = (e: FieldErrors | undefined, k: string) => e?.[k]?.[0];

type IconCmp = (props: { width?: number; height?: number }) => React.JSX.Element;

const TABS: { kind: SavedKind; anchor: string; Icon: IconCmp }[] = [
  { kind: "company", anchor: "empresas", Icon: BuildingIcon },
  { kind: "vehicle", anchor: "vehiculos", Icon: TruckIcon },
  { kind: "location", anchor: "lugares", Icon: MapPinIcon },
  { kind: "shipment", anchor: "rutas", Icon: RouteIcon },
];

function tabFromHash(): SavedKind {
  const hash = window.location.hash.replace("#", "");
  return TABS.find((t) => t.anchor === hash)?.kind ?? "company";
}

/** Company/vehicle/location go through the #24 `/api/saved/[kind]` route; a
 *  saved shipment (#113) has its own route with no `kind` segment. */
function apiPath(kind: SavedKind, id?: string): string {
  if (kind === "shipment") return id ? `/api/saved-shipments/${id}` : "/api/saved-shipments";
  return id ? `/api/saved/${kind}/${id}` : `/api/saved/${kind}`;
}

function matchesQuery(haystack: string, query: string): boolean {
  if (!query.trim()) return true;
  return haystack.toLocaleLowerCase("es-ES").includes(query.trim().toLocaleLowerCase("es-ES"));
}

export function DatosHabitualesManager({
  companies,
  vehicles,
  locations,
  shipments,
}: {
  companies: Company[];
  vehicles: Vehicle[];
  locations: Location[];
  shipments: Shipment[];
}) {
  const t = useT().panel.datos;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Starts at "company" (matches the server-rendered HTML) and corrects
  // itself right after mount from `location.hash` — reading the hash inside
  // the `useState` initializer instead would run during hydration too, but
  // Next.js still reconciles against the server's SSR output first, so the
  // hash-driven tab never actually took effect in practice; a post-mount
  // effect is the reliable fix for "client-only initial state" in general.
  const [tab, setTab] = useState<SavedKind>("company");
  const [query, setQuery] = useState("");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const openRefs = useRef<Partial<Record<SavedKind, () => void>>>({});

  useEffect(() => {
    setTab(tabFromHash());
  }, []);

  function selectTab(kind: SavedKind) {
    setTab(kind);
    setAddMenuOpen(false);
    const anchor = TABS.find((item) => item.kind === kind)!.anchor;
    if (typeof window !== "undefined") window.history.replaceState(null, "", `#${anchor}`);
  }

  /**
   * Create (no `id`) or edit (`id`) a saved record (#86 part 1). A 422 hands
   * the per-field zod messages back to the form so the user sees the exact
   * missing field, not a generic "revisa los datos".
   */
  async function save(kind: SavedKind, body: Body, id?: string): Promise<SaveResult> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiPath(kind, id), {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fields = data?.error?.fields as FieldErrors | undefined;
        if (!fields) setError(t.saveError);
        setBusy(false);
        return { ok: false, fields };
      }
      router.refresh();
      setBusy(false);
      return { ok: true };
    } catch {
      setError(t.offlineError);
      setBusy(false);
      return { ok: false };
    }
  }

  async function remove(kind: SavedKind, id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiPath(kind, id), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? t.removeError);
      } else {
        router.refresh();
      }
    } catch {
      setError(t.offlineError);
    }
    setBusy(false);
  }

  const counts = {
    company: companies.length,
    vehicle: vehicles.length,
    location: locations.length,
    shipment: shipments.length,
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-[var(--color-text-muted)]">{t.intro}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.countLabel(counts)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 text-sm">
          <span className="sr-only">{t.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            data-testid="datos-search"
            className="block min-h-11 w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-base"
          />
        </label>
        <div className="relative shrink-0">
          <button
            type="button"
            data-testid="add-menu-trigger"
            onClick={() => setAddMenuOpen((v) => !v)}
            className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
          >
            {t.addMenuTrigger}
          </button>
          {addMenuOpen && (
            <ul className="absolute right-0 z-10 mt-1 w-56 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] py-1 text-sm shadow-[0_8px_24px_rgba(15,23,32,0.12)]">
              {TABS.map((item) => (
                <li key={item.kind}>
                  <button
                    type="button"
                    data-testid={`add-menu-${item.kind}`}
                    onClick={() => {
                      selectTab(item.kind);
                      setAddMenuOpen(false);
                      openCreate(item.kind);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-[var(--color-surface)]"
                  >
                    {t.addMenuItem(t.addLabels[item.kind])}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <div
        role="tablist"
        aria-label={t.tabsLabel}
        className="mt-5 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-2"
      >
        {TABS.map((item) => (
          <button
            key={item.kind}
            type="button"
            role="tab"
            id={`tab-${item.kind}`}
            aria-selected={tab === item.kind}
            aria-controls={`panel-${item.kind}`}
            data-testid={`tab-${item.kind}`}
            onClick={() => selectTab(item.kind)}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-md)] px-3 text-sm font-medium ${
              tab === item.kind
                ? "bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <item.Icon width={16} height={16} />
            {t.tabs[item.kind]} ({counts[item.kind]})
          </button>
        ))}
      </div>

      {/* All 4 panels stay mounted (hidden via the `hidden` attribute, not
          conditional rendering) — the correct WAI-ARIA tabs pattern, and it
          keeps every `aria-controls`/tabpanel `id` pair valid in the DOM at
          all times (a conditionally-unmounted panel would leave the OTHER
          tabs' `aria-controls` pointing at nothing, an axe violation). */}
      <TabPanel<Company>
        t={t}
        kind="company"
        panelId="panel-company"
        tabId="tab-company"
        hidden={tab !== "company"}
        items={companies}
        query={query}
        busy={busy}
        save={save}
        remove={remove}
        primary={(c) => c.name}
        secondary={(c) =>
          [
            t.company.roleLabel[c.role],
            c.nif,
            [c.address, [c.postalCode, c.city].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", "),
            c.contactName ? `${t.company.contactPrefix}${c.contactName}` : null,
          ]
            .filter(Boolean)
            .join(" · ")
        }
        emptyTitle={t.company.emptyTitle}
        emptyBody={t.company.emptyBody}
        addLabel={t.addLabels.company}
        checkDuplicate={(list, body) => findDuplicateCompany(list, body)}
        renderForm={(props) => <CompanyForm {...props} t={t} />}
        registerOpenCreate={(fn) => {
          openRefs.current.company = fn;
        }}
      />
      <TabPanel<Vehicle>
        t={t}
        kind="vehicle"
        panelId="panel-vehicle"
        tabId="tab-vehicle"
        hidden={tab !== "vehicle"}
        items={vehicles}
        query={query}
        busy={busy}
        save={save}
        remove={remove}
        primary={(v) => v.alias || v.tractorPlate}
        secondary={(v) =>
          [
            v.alias ? v.tractorPlate : null,
            v.trailerPlate ? `${t.vehicle.trailerPrefix}${v.trailerPlate}` : null,
          ]
            .filter(Boolean)
            .join(" · ")
        }
        emptyTitle={t.vehicle.emptyTitle}
        emptyBody={t.vehicle.emptyBody}
        addLabel={t.addLabels.vehicle}
        checkDuplicate={(list, body) => findDuplicateVehicle(list, body)}
        renderForm={(props) => <VehicleForm {...props} t={t} />}
        registerOpenCreate={(fn) => {
          openRefs.current.vehicle = fn;
        }}
      />
      <TabPanel<Location>
        t={t}
        kind="location"
        panelId="panel-location"
        tabId="tab-location"
        hidden={tab !== "location"}
        items={locations}
        query={query}
        busy={busy}
        save={save}
        remove={remove}
        primary={(l) => l.name}
        secondary={(l) =>
          [
            t.location.typeLabel[l.type],
            [l.address, l.postalCode, l.city, l.province, l.country].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" · ")
        }
        emptyTitle={t.location.emptyTitle}
        emptyBody={t.location.emptyBody}
        addLabel={t.addLabels.location}
        checkDuplicate={(list, body) => findDuplicateLocation(list, body)}
        renderForm={(props) => <LocationForm {...props} t={t} />}
        registerOpenCreate={(fn) => {
          openRefs.current.location = fn;
        }}
      />
      <TabPanel<Shipment>
        t={t}
        kind="shipment"
        panelId="panel-shipment"
        tabId="tab-shipment"
        hidden={tab !== "shipment"}
        items={shipments}
        query={query}
        busy={busy}
        save={save}
        remove={remove}
        primary={(s) => savedShipmentLabel(s)}
        secondary={(s) =>
          [s.goods, s.weight, s.recipient ? `${t.shipment.recipientPrefix}${s.recipient}` : null]
            .filter(Boolean)
            .join(" · ")
        }
        emptyTitle={t.shipment.emptyTitle}
        emptyBody={locations.length < 2 ? t.shipment.needTwoLocations : t.shipment.emptyBody}
        addLabel={t.addLabels.shipment}
        addDisabled={locations.length < 2}
        checkDuplicate={(list, body) => findDuplicateShipment(list, body)}
        renderForm={(props) => <ShipmentForm {...props} t={t} locations={locations} />}
        registerOpenCreate={(fn) => {
          openRefs.current.shipment = fn;
        }}
      />

      <p className="mt-8 text-xs text-[var(--color-text-muted)]">{t.footerNote}</p>
    </div>
  );

  // Bridge so the top "+ Añadir dato habitual" menu can open the RIGHT tab's
  // create modal without lifting each TabPanel's local `createOpen` state up
  // (every panel stays self-contained; the menu just calls back into
  // whichever one owns that kind, via a ref each panel registers itself into
  // on mount — all 4 panels stay mounted at all times, see the comment above
  // their render below, so the ref is always populated by the time this runs).
  function openCreate(kind: SavedKind) {
    openRefs.current[kind]?.();
  }
}

type FormProps<T> = {
  initial?: T;
  submitLabel: string;
  fieldErrors: FieldErrors;
  busy: boolean;
  onSubmit: OnSubmit;
  onCancel?: () => void;
};

function TabPanel<T extends { id: string; favorite: boolean }>({
  t,
  kind,
  panelId,
  tabId,
  hidden,
  items,
  query,
  busy,
  save,
  remove,
  primary,
  secondary,
  emptyTitle,
  emptyBody,
  addLabel,
  addDisabled,
  checkDuplicate,
  renderForm,
  registerOpenCreate,
}: {
  t: DatosMessages;
  kind: SavedKind;
  panelId: string;
  tabId: string;
  hidden: boolean;
  items: T[];
  query: string;
  busy: boolean;
  save: (kind: SavedKind, body: Body, id?: string) => Promise<SaveResult>;
  remove: (kind: SavedKind, id: string) => void;
  primary: (item: T) => string;
  secondary: (item: T) => string;
  emptyTitle: string;
  emptyBody: string;
  addLabel: string;
  addDisabled?: boolean;
  checkDuplicate: (list: T[], body: Body) => T | undefined;
  renderForm: (props: FormProps<T>) => React.ReactNode;
  registerOpenCreate: (fn: (() => void) | undefined) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [addErrors, setAddErrors] = useState<FieldErrors>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);
  const [pendingDuplicate, setPendingDuplicate] = useState<{ body: Body; match: T } | null>(null);

  useEffect(() => {
    registerOpenCreate(() => setCreateOpen(true));
    return () => registerOpenCreate(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter((it) => matchesQuery(`${primary(it)} ${secondary(it)}`, query));

  const doSave =
    (id: string | undefined, setErrs: (e: FieldErrors) => void, close: () => void): OnSubmit =>
    async (body) => {
      // #113 §13 — soft duplicate warning, never a block. Skipped on EDIT
      // (the record being edited is naturally its own "duplicate").
      if (!id) {
        const match = checkDuplicate(items, body);
        if (match) {
          setPendingDuplicate({ body, match });
          return { ok: true }; // form stays open; the warning takes over
        }
      }
      const r = await save(kind, body, id);
      setErrs(r.fields ?? {});
      if (r.ok) {
        if (id) setEditingId(null);
        else {
          setAddKey((k) => k + 1);
          close();
        }
      }
      return r;
    };

  return (
    <section id={panelId} role="tabpanel" aria-labelledby={tabId} hidden={hidden} className="mt-4">
      {filtered.length > 0 ? (
        <ul className="space-y-2">
          {filtered.map((it) => {
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
                  <span className="flex shrink-0 flex-wrap justify-end gap-3">
                    <Link href="/crear" className="text-sm text-[var(--color-primary)] underline">
                      {t.use}
                    </Link>
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
                      {isEditing ? t.close : t.edit}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(kind, it.id)}
                      className="text-sm text-[var(--color-danger)] underline disabled:opacity-55"
                    >
                      {t.delete}
                    </button>
                  </span>
                </div>
                {isEditing && (
                  <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                    {renderForm({
                      initial: it,
                      submitLabel: t.saveChanges,
                      fieldErrors: editErrors,
                      busy,
                      onSubmit: doSave(it.id, setEditErrors, () => setEditingId(null)),
                      onCancel: () => setEditingId(null),
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="font-medium">{emptyTitle}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{emptyBody}</p>
          {!addDisabled && (
            <button
              type="button"
              data-testid={`add-${kind}`}
              onClick={() => setCreateOpen(true)}
              className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary)]"
            >
              {t.addFirst(addLabel)}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">{t.noResults}</p>
      )}

      {items.length > 0 && !addDisabled && (
        <button
          type="button"
          data-testid={`add-${kind}`}
          onClick={() => setCreateOpen(true)}
          className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]"
        >
          {t.add(addLabel)}
        </button>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        titleId={`create-${kind}-title`}
      >
        <h2 id={`create-${kind}-title`} className="text-base font-bold">
          {t.addTitle(addLabel)}
        </h2>
        {pendingDuplicate ? (
          <div className="mt-3" data-testid={`duplicate-warning-${kind}`}>
            <p className="text-sm">
              {t.duplicateFoundPrefix}
              <strong>{primary(pendingDuplicate.match)}</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="duplicate-use-existing"
                onClick={() => {
                  setPendingDuplicate(null);
                  setCreateOpen(false);
                }}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
              >
                {t.useExisting}
              </button>
              <button
                type="button"
                data-testid="duplicate-save-anyway"
                disabled={busy}
                onClick={async () => {
                  const body = pendingDuplicate.body;
                  setPendingDuplicate(null);
                  const r = await save(kind, body);
                  setAddErrors(r.fields ?? {});
                  if (r.ok) {
                    setAddKey((k) => k + 1);
                    setCreateOpen(false);
                  }
                }}
                className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
              >
                {t.saveAnyway}
              </button>
            </div>
          </div>
        ) : (
          <div key={addKey}>
            {renderForm({
              submitLabel: t.save,
              fieldErrors: addErrors,
              busy,
              onSubmit: doSave(undefined, setAddErrors, () => setCreateOpen(false)),
              onCancel: () => setCreateOpen(false),
            })}
          </div>
        )}
      </Modal>
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
  const cancelLabel = useT().panel.datos.cancel;
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
            {cancelLabel}
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
  t,
}: FormProps<Company> & { t: DatosMessages }) {
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
        <span className="font-medium">{t.company.roleFieldLabel}</span>
        <select
          data-testid="c-role"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.role}
          onChange={(e) => setF((s) => ({ ...s, role: e.target.value }))}
        >
          <option value="both">{t.company.roleLabel.both}</option>
          <option value="shipper">{t.company.roleLabel.shipper}</option>
          <option value="carrier">{t.company.roleLabel.carrier}</option>
        </select>
      </label>
      <Field
        id="c-name"
        label={t.company.nameLabel}
        value={f.name}
        error={err1(fieldErrors, "name")}
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="c-nif"
        label={t.company.nifLabel}
        value={f.nif}
        error={err1(fieldErrors, "nif")}
        onChange={(v) => setF((s) => ({ ...s, nif: v }))}
      />
      <Field
        id="c-address"
        label={t.company.addressLabel}
        value={f.address}
        error={err1(fieldErrors, "address")}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
      />
      <Field
        id="c-postal-code"
        label={t.company.postalCodeLabel}
        value={f.postalCode}
        error={err1(fieldErrors, "postalCode")}
        onChange={(v) => setF((s) => ({ ...s, postalCode: v }))}
      />
      <Field
        id="c-city"
        label={t.company.cityLabel}
        value={f.city}
        error={err1(fieldErrors, "city")}
        onChange={(v) => setF((s) => ({ ...s, city: v }))}
      />
      <Field
        id="c-contact-name"
        label={t.company.contactNameLabel}
        required={false}
        value={f.contactName}
        onChange={(v) => setF((s) => ({ ...s, contactName: v }))}
      />
      <Field
        id="c-contact-phone"
        label={t.company.contactPhoneLabel}
        required={false}
        value={f.contactPhone}
        onChange={(v) => setF((s) => ({ ...s, contactPhone: v }))}
      />
      <Field
        id="c-contact-email"
        label={t.company.contactEmailLabel}
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
  t,
}: FormProps<Vehicle> & { t: DatosMessages }) {
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
        label={t.vehicle.aliasLabel}
        required={false}
        value={f.alias}
        onChange={(v) => setF((s) => ({ ...s, alias: v }))}
      />
      <Field
        id="v-tractor"
        label={t.vehicle.tractorLabel}
        value={f.tractorPlate}
        error={err1(fieldErrors, "tractorPlate")}
        onChange={(v) => setF((s) => ({ ...s, tractorPlate: v }))}
      />
      <Field
        id="v-trailer"
        label={t.vehicle.trailerLabel}
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
  t,
}: FormProps<Location> & { t: DatosMessages }) {
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
        <span className="font-medium">{t.location.usageFieldLabel}</span>
        <select
          data-testid="l-type"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.type}
          onChange={(e) => setF((s) => ({ ...s, type: e.target.value }))}
        >
          <option value="both">{t.location.usageOptions.both}</option>
          <option value="load">{t.location.usageOptions.load}</option>
          <option value="unload">{t.location.usageOptions.unload}</option>
        </select>
      </label>
      <Field
        id="l-name"
        label={t.location.nameLabel}
        value={f.name}
        error={err1(fieldErrors, "name")}
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <Field
        id="l-address"
        label={t.location.addressLabel}
        value={f.address}
        error={err1(fieldErrors, "address")}
        onChange={(v) => setF((s) => ({ ...s, address: v }))}
      />
      <Field
        id="l-postal-code"
        label={t.location.postalCodeLabel}
        value={f.postalCode}
        error={err1(fieldErrors, "postalCode")}
        onChange={(v) => setF((s) => ({ ...s, postalCode: v }))}
      />
      <Field
        id="l-city"
        label={t.location.cityLabel}
        value={f.city}
        error={err1(fieldErrors, "city")}
        onChange={(v) => setF((s) => ({ ...s, city: v }))}
      />
      <Field
        id="l-province"
        label={t.location.provinceLabel}
        value={f.province}
        onChange={(v) => setF((s) => ({ ...s, province: v }))}
        required={false}
      />
      <Field
        id="l-country"
        label={t.location.countryLabel}
        value={f.country}
        onChange={(v) => setF((s) => ({ ...s, country: v }))}
      />
    </FormWrap>
  );
}

/** #113 — a saved shipment ALWAYS references two existing saved places by id
 *  (never a free-text address, issue §12): two `<select>`s over `locations`,
 *  mirroring the wizard's own `autofill-load-location`/`-unload-location`
 *  pattern but as the primary input here rather than an autofill shortcut. */
function ShipmentForm({
  initial,
  submitLabel,
  fieldErrors,
  busy,
  onSubmit,
  onCancel,
  locations,
  t,
}: FormProps<Shipment> & { locations: Location[]; t: DatosMessages }) {
  const [f, setF] = useState<Body>({
    name: initial?.name ?? "",
    loadLocationId: initial?.loadLocationId ?? "",
    unloadLocationId: initial?.unloadLocationId ?? "",
    goods: initial?.goods ?? "",
    weight: initial?.weight ?? "",
    recipient: initial?.recipient ?? "",
  });
  return (
    <FormWrap
      busy={busy}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={() => onSubmit(f)}
    >
      <Field
        id="s-name"
        label={t.shipment.nameLabel}
        required={false}
        value={f.name}
        onChange={(v) => setF((s) => ({ ...s, name: v }))}
      />
      <label className="mt-3 block text-sm">
        <span className="font-medium">{t.shipment.loadLocationLabel}</span>
        <select
          data-testid="s-load-location"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.loadLocationId}
          onChange={(e) => setF((s) => ({ ...s, loadLocationId: e.target.value }))}
        >
          <option value="">{t.shipment.selectPlaceholder}</option>
          {locations
            .filter((l) => l.type !== "unload")
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.city ? ` — ${l.city}` : ""}
              </option>
            ))}
        </select>
        {err1(fieldErrors, "loadLocationId") && (
          <span className="mt-1 block text-sm text-[var(--color-danger)]">
            {err1(fieldErrors, "loadLocationId")}
          </span>
        )}
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-medium">{t.shipment.unloadLocationLabel}</span>
        <select
          data-testid="s-unload-location"
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          value={f.unloadLocationId}
          onChange={(e) => setF((s) => ({ ...s, unloadLocationId: e.target.value }))}
        >
          <option value="">{t.shipment.selectPlaceholder}</option>
          {locations
            .filter((l) => l.type !== "load")
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.city ? ` — ${l.city}` : ""}
              </option>
            ))}
        </select>
        {err1(fieldErrors, "unloadLocationId") && (
          <span className="mt-1 block text-sm text-[var(--color-danger)]">
            {err1(fieldErrors, "unloadLocationId")}
          </span>
        )}
      </label>
      <Field
        id="s-goods"
        label={t.shipment.goodsLabel}
        required={false}
        value={f.goods}
        onChange={(v) => setF((s) => ({ ...s, goods: v }))}
      />
      <Field
        id="s-weight"
        label={t.shipment.weightLabel}
        required={false}
        value={f.weight}
        onChange={(v) => setF((s) => ({ ...s, weight: v }))}
      />
      <Field
        id="s-recipient"
        label={t.shipment.recipientLabel}
        required={false}
        value={f.recipient}
        onChange={(v) => setF((s) => ({ ...s, recipient: v }))}
      />
    </FormWrap>
  );
}
