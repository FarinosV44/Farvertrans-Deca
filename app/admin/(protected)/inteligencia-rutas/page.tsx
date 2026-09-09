import Link from "next/link";
import { topCorridors, consentedCompanyCount } from "@/lib/admin/route-intelligence";
import { rangeFromParam } from "@/lib/admin/range";
import { PageHeader, Table, Row, Cell, Empty, KpiGrid, Kpi } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

type SP = { [k: string]: string | string[] | undefined };

/**
 * Cross-company route intelligence (DATA #45 §5, PRODUCT #56). Read-only —
 * only shows corridors from companies with an explicit, granted
 * `CommercialConsent`; nothing here drives commercial matching yet.
 */
export default async function AdminInteligenciaRutas({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const range = rangeFromParam(one("range"));

  const [corridors, consent] = await Promise.all([
    topCorridors(range.since, 30),
    consentedCompanyCount(),
  ]);

  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { range: range.value, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    return `/admin/inteligencia-rutas?${p.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inteligencia de rutas"
        lead="Corredores más frecuentes entre empresas con consentimiento comercial explícito (DATA #45). Solo lectura — todavía no alimenta ningún matching comercial."
      />

      <KpiGrid>
        <Kpi
          label="Empresas con consentimiento"
          value={consent.consented}
          sub={`de ${consent.total} registradas`}
        />
        <Kpi label="Corredores en el periodo" value={corridors.length} sub={range.label} />
      </KpiGrid>

      <div className="flex flex-wrap gap-2 text-sm">
        {(["24h", "7d", "30d", "90d"] as const).map((r) => (
          <Link
            key={r}
            href={link({ range: r })}
            aria-current={range.value === r ? "true" : undefined}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${
              range.value === r
                ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {r}
          </Link>
        ))}
      </div>

      {corridors.length === 0 ? (
        <Empty>
          {consent.consented === 0
            ? "Ninguna empresa ha dado consentimiento comercial todavía — no hay datos que mostrar."
            : "Ningún corredor con estos filtros."}
        </Empty>
      ) : (
        <Table head={["Origen", "Destino", "DeCA", "Empresas", "Última vez (UTC)"]}>
          {corridors.map((c) => (
            <Row key={c.key}>
              <Cell>
                {c.loadCity}
                {c.loadCountry ? `, ${c.loadCountry}` : ""}
              </Cell>
              <Cell>
                {c.unloadCity}
                {c.unloadCountry ? `, ${c.unloadCountry}` : ""}
              </Cell>
              <Cell mono>{c.count}</Cell>
              <Cell mono>{c.companyCount}</Cell>
              <Cell mono>{c.lastUsedAt.toISOString().slice(0, 16).replace("T", " ")}</Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
