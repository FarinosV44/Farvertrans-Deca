import Link from "next/link";
import { refreshAlerts, listAlerts, getAlertConfig } from "@/lib/commercial/alerts";
import { CORRIDORS } from "@/lib/commercial/corridors";
import { ALERT_RULES } from "@/lib/commercial/alert-rules";
import { AlertActions } from "@/components/admin/alert-actions";
import { AlertConfigForm } from "@/components/admin/alert-config-form";
import { PageHeader, Table, Row, Cell, Empty, KpiGrid, Kpi } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

const RULE_LABEL = Object.fromEntries(ALERT_RULES.map((r) => [r.kind, r.label]));
const dt = (d: Date) => d.toISOString().slice(0, 10);

/**
 * `Super Admin > Alertas comerciales` (#90). Internal, rule-based alerts
 * recomputed on load from our own data — never sent anywhere, only for
 * consented companies. Mark reviewed / dismissed; identical alerts are
 * de-duplicated by rule + company + time bucket.
 */
export default async function AdminAlertasComerciales() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  await refreshAlerts();
  const [pending, reviewed, config] = await Promise.all([
    listAlerts("pending"),
    listAlerts("reviewed"),
    getAlertConfig(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Alertas comerciales"
        lead="Transportistas y patrones que probablemente merecen una acción comercial. Reglas simples sobre datos propios; nada se envía automáticamente."
      />

      <KpiGrid>
        <Kpi label="Pendientes" value={pending.length} />
        <Kpi label="Revisadas" value={reviewed.length} />
        <Kpi label="Reglas activas" value={ALERT_RULES.length} />
      </KpiGrid>

      <AlertConfigForm
        config={config}
        corridors={CORRIDORS.map((c) => ({ id: c.id, label: c.label }))}
      />

      <section>
        <h2 className="mb-2 text-sm font-bold">Pendientes</h2>
        {pending.length === 0 ? (
          <Empty>Ninguna alerta pendiente.</Empty>
        ) : (
          <Table head={["Prioridad", "Alerta", "Empresa", "Ruta", "Detectada", "Acción"]}>
            {pending.map((a) => (
              <Row key={a.id}>
                <Cell mono>{a.score}</Cell>
                <Cell>
                  <span className="font-medium">{a.title}</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">
                    {RULE_LABEL[a.kind] ?? a.kind} · {a.detail}
                  </span>
                </Cell>
                <Cell>
                  <Link href={`/admin/empresas/${a.companyId}`} className="no-underline">
                    {a.companyName}
                  </Link>
                </Cell>
                <Cell>{a.routeContext ?? "—"}</Cell>
                <Cell mono>{dt(a.createdAt)}</Cell>
                <Cell>
                  <AlertActions id={a.id} />
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold">Revisadas recientemente</h2>
          <Table head={["Alerta", "Empresa", "Detectada"]}>
            {reviewed.slice(0, 20).map((a) => (
              <Row key={a.id}>
                <Cell>{a.title}</Cell>
                <Cell>
                  <Link href={`/admin/empresas/${a.companyId}`} className="no-underline">
                    {a.companyName}
                  </Link>
                </Cell>
                <Cell mono>{dt(a.createdAt)}</Cell>
              </Row>
            ))}
          </Table>
        </section>
      )}
    </div>
  );
}
