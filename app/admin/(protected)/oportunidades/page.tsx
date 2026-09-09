import Link from "next/link";
import { listOpportunities } from "@/lib/commercial/opportunities";
import {
  OPPORTUNITY_STATE_LABEL,
  type OpportunityFilter,
  type OpportunitySort,
} from "@/lib/commercial/opportunity-model";
import { CORRIDORS } from "@/lib/commercial/corridors";
import { commercialChannelLabelEs } from "@/lib/commercial/types";
import { OpportunityActions } from "@/components/admin/opportunity-actions";
import { PageHeader, Table, Row, Cell, Empty, KpiGrid, Kpi } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

type SP = { [k: string]: string | string[] | undefined };

const one = (sp: SP, k: string) =>
  (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined))?.trim() || undefined;

const SORTS: { value: OpportunitySort; label: string }[] = [
  { value: "recent", label: "Actividad reciente" },
  { value: "recurrence", label: "Mayor recurrencia" },
  { value: "volume", label: "Nº de movimientos" },
  { value: "upcoming", label: "Próxima descarga" },
];

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");

/**
 * `Super Admin > Oportunidades` (#87). Every carrier with an active commercial
 * consent, its observed route activity, the authorised contact channel and a
 * manual follow-up state. Read-only data + one manual action per row; nothing
 * is messaged automatically.
 */
export default async function AdminOportunidades({ searchParams }: { searchParams: Promise<SP> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const sp = await searchParams;

  const filter: OpportunityFilter = {
    q: one(sp, "q"),
    originCountry: one(sp, "originCountry"),
    originProvince: one(sp, "originProvince"),
    originCity: one(sp, "originCity"),
    destCountry: one(sp, "destCountry"),
    destProvince: one(sp, "destProvince"),
    destCity: one(sp, "destCity"),
    unloadFrom: one(sp, "unloadFrom"),
    unloadTo: one(sp, "unloadTo"),
    activity: (["7d", "30d", "90d"] as const).find((a) => a === one(sp, "activity")),
    corridor: one(sp, "corridor"),
    operator: one(sp, "operator"),
    state: (
      [
        "review",
        "contacted",
        "interested",
        "unavailable",
        "discarded",
        "converted",
        "open",
      ] as const
    ).find((s) => s === one(sp, "state")) as OpportunityFilter["state"],
    sort: SORTS.map((s) => s.value).find((s) => s === one(sp, "sort")) ?? "recent",
  };

  const { opportunities, eligibleCount, operators } = await listOpportunities(filter);

  const field = (name: string, label: string, placeholder = "") => (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <input
        name={name}
        defaultValue={one(sp, name) ?? ""}
        placeholder={placeholder}
        className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Oportunidades"
        lead="Transportistas con consentimiento comercial activo y su actividad de rutas observada. Filtra por zona/fecha para obtener una lista accionable; ninguna comunicación se envía de forma automática."
      />

      <KpiGrid>
        <Kpi label="Con consentimiento" value={eligibleCount} sub="empresas elegibles" />
        <Kpi label="En la lista" value={opportunities.length} sub="tras los filtros" />
        <Kpi
          label="Contactables"
          value={opportunities.filter((o) => o.contactable).length}
          sub="activas y sin cerrar"
        />
      </KpiGrid>

      <form
        method="get"
        className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {field("q", "Empresa")}
          {field("originCountry", "Origen · país")}
          {field("originProvince", "Origen · provincia")}
          {field("originCity", "Origen · ciudad")}
          {field("destCountry", "Destino · país")}
          {field("destProvince", "Destino · provincia")}
          {field("destCity", "Destino · ciudad", "p. ej. Lyon")}
          {field("unloadFrom", "Descarga desde", "AAAA-MM-DD")}
          {field("unloadTo", "Descarga hasta", "AAAA-MM-DD")}
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Actividad</span>
            <select
              name="activity"
              defaultValue={one(sp, "activity") ?? ""}
              className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
            >
              <option value="">Cualquiera</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Corredor</span>
            <select
              name="corridor"
              defaultValue={one(sp, "corridor") ?? ""}
              className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
            >
              <option value="">Cualquiera</option>
              {CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Operador</span>
            <select
              name="operator"
              defaultValue={one(sp, "operator") ?? ""}
              className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
            >
              <option value="">Cualquiera</option>
              {operators.map((o) => (
                <option key={o.refCode} value={o.refCode}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Estado</span>
            <select
              name="state"
              defaultValue={one(sp, "state") ?? ""}
              className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="open">Abiertos (revisar/contactado/interesado)</option>
              {(
                [
                  "review",
                  "contacted",
                  "interested",
                  "unavailable",
                  "discarded",
                  "converted",
                ] as const
              ).map((s) => (
                <option key={s} value={s}>
                  {OPPORTUNITY_STATE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Ordenar</span>
            <select
              name="sort"
              defaultValue={one(sp, "sort") ?? "recent"}
              className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)]"
          >
            Filtrar
          </button>
          <Link
            href="/admin/oportunidades"
            className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm no-underline"
          >
            Limpiar
          </Link>
        </div>
      </form>

      {opportunities.length === 0 ? (
        <Empty>
          {eligibleCount === 0
            ? "Ninguna empresa tiene consentimiento comercial activo todavía."
            : "Ningún transportista con estos filtros."}
        </Empty>
      ) : (
        <Table
          head={[
            "Empresa",
            "Ruta observada",
            "Zona fin",
            "Próx. descarga",
            "Actividad",
            "Recurrencia",
            "Consentimiento",
            "Operador",
            "Acción",
          ]}
        >
          {opportunities.map((o) => (
            <Row key={o.companyId}>
              <Cell>
                <Link href={`/admin/empresas/${o.companyId}`} className="font-medium no-underline">
                  {o.companyName}
                </Link>
                {o.companyContactName && (
                  <span className="block text-xs text-[var(--color-text-muted)]">
                    {o.companyContactName}
                  </span>
                )}
                {o.companyStatus !== "active" && (
                  <span className="block text-xs text-[var(--color-danger)]">
                    {o.companyStatus}
                  </span>
                )}
              </Cell>
              <Cell>
                {o.latestRoute ? (
                  <>
                    {(o.latestRoute.loadCity ?? "—") + " → " + (o.latestRoute.unloadCity ?? "—")}
                    {o.corridorLabels.length > 0 && (
                      <span className="block text-xs text-[var(--color-text-muted)]">
                        {o.corridorLabels.join(" · ")}
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell>{o.endZoneLabels.join(", ") || "—"}</Cell>
              <Cell mono>{o.nextUnloadDate ?? "—"}</Cell>
              <Cell>
                <span className="block text-xs">últ. {day(o.lastActivityAt)}</span>
                <span className="block text-xs text-[var(--color-text-muted)]">
                  {o.movements.d30}/{o.movements.d60}/{o.movements.d90} (30/60/90d)
                </span>
              </Cell>
              <Cell>
                {o.topRouteRepeat > 1 ? (
                  <>
                    <span className="font-mono">×{o.topRouteRepeat}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {o.topRouteLabel}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell>
                <span className="block text-xs">
                  {o.consentMode === "all" ? "Todos los portes" : "Por porte"}
                </span>
                <span className="block text-xs text-[var(--color-text-muted)]">
                  {commercialChannelLabelEs(o.channel)}
                </span>
              </Cell>
              <Cell>{o.operator?.name ?? o.lastOperatorRefCode ?? "—"}</Cell>
              <Cell>
                <OpportunityActions
                  companyId={o.companyId}
                  companyName={o.companyName}
                  state={o.state}
                  note={o.note}
                  channel={o.channel}
                  contactEmail={o.contactEmail}
                  contactPhone={o.contactPhone}
                  outcome={{
                    internalRef: o.outcome.internalRef ?? "",
                    firstPorteDate: o.outcome.firstPorteDate
                      ? o.outcome.firstPorteDate.toISOString().slice(0, 10)
                      : "",
                    loadsGenerated: o.outcome.loadsGenerated?.toString() ?? "",
                    revenueEur: o.outcome.revenueEur?.toString() ?? "",
                    marginEur: o.outcome.marginEur?.toString() ?? "",
                  }}
                />
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
