import Link from "next/link";
import { commercialKpis, recentCommercialActivity } from "@/lib/commercial/kpis";
import {
  OPPORTUNITY_STATE_LABEL,
  ACTIVITY_CHANNEL_LABEL,
} from "@/lib/commercial/opportunity-model";
import { CORRIDORS } from "@/lib/commercial/corridors";
import { PageHeader, Table, Row, Cell, Empty, KpiGrid, Kpi } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type SP = { [k: string]: string | string[] | undefined };
const one = (sp: SP, k: string) =>
  (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined))?.trim() || undefined;
const eur = (n: number) => `${n.toLocaleString("es-ES")} €`;
const dt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

/**
 * `Super Admin > Panel comercial` (#89). The funnel
 * `DeCA → oportunidad → contacto → conversión → facturación/margen`, computed
 * from our own rows. Attribution keeps acquisition (referral) and commercial
 * conversion separate.
 */
export default async function AdminComercial({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filter = {
    from: one(sp, "from"),
    to: one(sp, "to"),
    acquisitionOperator: one(sp, "acqOp"),
    commercialOperator: one(sp, "comOp"),
    country: one(sp, "country"),
    corridor: one(sp, "corridor"),
  };

  const [k, activity] = await Promise.all([commercialKpis(filter), recentCommercialActivity(40)]);

  const field = (name: string, label: string, ph = "") => (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <input
        name={name}
        defaultValue={one(sp, name) ?? ""}
        placeholder={ph}
        className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Panel comercial"
        lead="Cuánto negocio real genera DeCA Profesional y qué operadores/canales lo originan. Sin CRM externo — todo desde datos propios."
      />

      <form
        method="get"
        className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {field("from", "Desde", "AAAA-MM-DD")}
        {field("to", "Hasta", "AAAA-MM-DD")}
        {field("acqOp", "Operador captación (ref)")}
        {field("comOp", "Operador comercial (user id)")}
        {field("country", "País (ruta)")}
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
        <div className="col-span-full flex gap-2">
          <button
            type="submit"
            className="min-h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)]"
          >
            Aplicar
          </button>
          <Link
            href="/admin/comercial"
            className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm no-underline"
          >
            Limpiar
          </Link>
        </div>
      </form>

      <KpiGrid>
        <Kpi label="Oportunidades detectadas" value={k.detected} />
        <Kpi label="Contactadas" value={k.contacted} />
        <Kpi label="Interesadas" value={k.interested} />
        <Kpi label="Convertidas" value={k.converted} sub={`${k.conversionRate}% conversión`} />
        <Kpi label="Cargas conseguidas" value={k.loads} />
        <Kpi label="Facturación atribuida" value={eur(k.revenueEur)} />
        <Kpi label="Margen atribuido" value={eur(k.marginEur)} />
      </KpiGrid>

      <section>
        <h2 className="mb-2 text-sm font-bold">Embudo</h2>
        <Table head={["Estado", "Empresas"]}>
          {k.funnel.map((f) => (
            <Row key={f.state}>
              <Cell>{f.label}</Cell>
              <Cell mono>{f.count}</Cell>
            </Row>
          ))}
        </Table>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-bold">Por operador de captación (referral)</h2>
          {k.byAcquisitionOperator.length === 0 ? (
            <Empty>Sin datos.</Empty>
          ) : (
            <Table head={["Ref", "Detectadas", "Convertidas"]}>
              {k.byAcquisitionOperator.map((r) => (
                <Row key={r.code}>
                  <Cell mono>{r.code}</Cell>
                  <Cell mono>{r.detected}</Cell>
                  <Cell mono>{r.converted}</Cell>
                </Row>
              ))}
            </Table>
          )}
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold">Por operador comercial interno</h2>
          {k.byCommercialOperator.length === 0 ? (
            <Empty>Sin datos.</Empty>
          ) : (
            <Table head={["Operador", "Acciones", "Convertidas"]}>
              {k.byCommercialOperator.map((r) => (
                <Row key={r.userId}>
                  <Cell>{r.email}</Cell>
                  <Cell mono>{r.actions}</Cell>
                  <Cell mono>{r.converted}</Cell>
                </Row>
              ))}
            </Table>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold">Actividad comercial reciente</h2>
        {activity.length === 0 ? (
          <Empty>Sin acciones registradas todavía.</Empty>
        ) : (
          <Table head={["Fecha (UTC)", "Empresa", "Operador", "Cambio", "Canal", "Nota"]}>
            {activity.map((a, i) => (
              <Row key={i}>
                <Cell mono>{dt(a.createdAt)}</Cell>
                <Cell>
                  <Link href={`/admin/empresas/${a.companyId}`} className="no-underline">
                    {a.companyName}
                  </Link>
                </Cell>
                <Cell>{a.actorEmail ?? "—"}</Cell>
                <Cell>
                  {a.fromState ? OPPORTUNITY_STATE_LABEL[a.fromState] : "—"} →{" "}
                  {a.toState ? OPPORTUNITY_STATE_LABEL[a.toState] : "—"}
                </Cell>
                <Cell>
                  {ACTIVITY_CHANNEL_LABEL[a.channel as keyof typeof ACTIVITY_CHANNEL_LABEL] ??
                    a.channel}
                </Cell>
                <Cell>{a.note ?? "—"}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
