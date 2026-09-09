import Link from "next/link";
import { overviewMetrics, operationalAlerts, contentStats } from "@/lib/admin/metrics";
import {
  listCompanySegments,
  funnelFromSegments,
  companiesToContact,
  opportunitySignals,
} from "@/lib/admin/segments";
import { PageHeader, Kpi, KpiGrid, Badge } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

/**
 * Admin Resumen (#80 / #72 / #83). Answers three questions on the first screen —
 * is the platform working, who is really using it, what needs attention now —
 * and pushes everything else behind "Más métricas".
 */
export default async function AdminOverview() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const [metrics, alerts, content, segments] = await Promise.all([
    overviewMetrics(),
    operationalAlerts(),
    contentStats(),
    listCompanySegments(),
  ]);
  const funnel = funnelFromSegments(segments);
  const toContact = companiesToContact(segments);
  const signals = opportunitySignals(segments);
  const today = metrics.windows.find((w) => w.window === "today");
  const d30 = metrics.windows.find((w) => w.window === "30d");
  const conv =
    funnel.registered > 0 ? Math.round((funnel.firstDeca / funnel.registered) * 100) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen" lead="Estado del producto, uso real y prioridades." />

      <KpiGrid>
        <Kpi label="Empresas activas 30d" value={funnel.active30d} />
        <Kpi label="DeCA hoy" value={today?.decaGenerated ?? 0} />
        <Kpi label="DeCA 30d" value={d30?.decaGenerated ?? 0} />
        <Kpi label="Conversión a 1er DeCA" value={conv === null ? "—" : `${conv}%`} />
        <Kpi label="Incidencias abiertas" value={metrics.totals.unresolvedFailures} />
        <Kpi
          label="Éxito de generación 7d"
          value={pct(metrics.windows.find((w) => w.window === "7d")?.successRate ?? null)}
        />
      </KpiGrid>

      <section aria-labelledby="funnel">
        <h2 id="funnel" className="mb-2 text-sm font-bold">
          Activación
        </h2>
        <ol className="flex flex-wrap gap-2 text-sm" data-testid="admin-funnel">
          {[
            ["Registradas", funnel.registered],
            ["Perfil completo", funnel.profileComplete],
            ["1er DeCA", funnel.firstDeca],
            ["Repiten (2+)", funnel.repeated],
            ["Activas 7d", funnel.active7d],
            ["Activas 30d", funnel.active30d],
          ].map(([label, n]) => (
            <li
              key={label}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5"
            >
              <span className="font-bold tabular-nums">{n}</span>{" "}
              <span className="text-[var(--color-text-muted)]">{label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-sm">
          <Link href="/admin/activacion">Ver funnel y detalle →</Link>
        </p>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact" className="mb-2 text-sm font-bold">
          Empresas a contactar
        </h2>
        {toContact.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]">
            Nada urgente: nadie con onboarding parado ni primer uso sin repetición.
          </p>
        ) : (
          <ul className="space-y-1.5" data-testid="admin-contact-list">
            {toContact.slice(0, 8).map((c) => (
              <li
                key={c.company.id + c.bucket}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-2.5 text-sm"
              >
                <span>
                  <Link href={`/admin/empresas/${c.company.id}`} className="font-medium">
                    {c.company.name}
                  </Link>
                  <span className="text-[var(--color-text-muted)]"> — {c.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="alerts">
        <h2 id="alerts" className="mb-2 text-sm font-bold">
          Alertas del sistema
        </h2>
        {alerts.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text-muted)]">
            Sin alertas. La generación funciona y las dependencias responden.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="admin-alerts">
            {alerts.map((a, i) => (
              <li
                key={i}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={a.level}>{a.level === "red" ? "Crítico" : "Aviso"}</Badge>
                  <span className="text-sm font-medium">{a.title}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{a.detail}</p>
                {a.href && (
                  <Link href={a.href} className="mt-1 inline-block text-sm">
                    Revisar →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {signals.length > 0 && (
        <section aria-labelledby="signals">
          <h2 id="signals" className="mb-2 text-sm font-bold">
            Señales de oportunidad de producto
          </h2>
          <ul className="space-y-1.5" data-testid="admin-signals">
            {signals.slice(0, 6).map((s) => (
              <li
                key={s.company.id + s.signal}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2.5 text-sm"
              >
                <Link href={`/admin/empresas/${s.company.id}`} className="font-medium">
                  {s.company.name}
                </Link>
                <span className="text-[var(--color-text-muted)]"> — {s.signal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
        <summary className="cursor-pointer text-sm font-bold">Más métricas</summary>
        <div className="mt-3 space-y-5">
          {metrics.windows.map((w) => (
            <section key={w.window}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                {w.window === "today"
                  ? "Hoy"
                  : w.window === "7d"
                    ? "Últimos 7 días"
                    : "Últimos 30 días"}
              </h3>
              <KpiGrid>
                <Kpi label="DeCA generados" value={w.decaGenerated} />
                <Kpi
                  label="Tasa de éxito"
                  value={pct(w.successRate)}
                  sub={`${w.decaFailed} fallidos`}
                />
                <Kpi
                  label="Anónimos / con cuenta"
                  value={`${w.anonymousDeca} / ${w.authenticatedDeca}`}
                />
                <Kpi
                  label="Empresas activas"
                  value={w.activeCompanies}
                  sub={`${w.newCompanies} nuevas`}
                />
                <Kpi label="Activaciones (1er DeCA)" value={w.firstDecaActivations} />
                <Kpi label="Usuarios nuevos" value={w.newUsers} />
              </KpiGrid>
            </section>
          ))}
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              Totales · captación · contenido
            </h3>
            <KpiGrid>
              <Kpi label="Empresas" value={metrics.totals.companies} />
              <Kpi label="Usuarios" value={metrics.totals.users} />
              <Kpi label="DeCA (histórico)" value={metrics.totals.deca} />
              <Kpi
                label="Prospectos por activar"
                value={metrics.acquisition.prospectsAwaitingActivation}
              />
              <Kpi label="Operador líder" value={metrics.acquisition.topRefCode?.code ?? "—"} />
              <Kpi
                label="Guías / blog publicados"
                value={`${content.guidesPublished} / ${content.blogPublished}`}
              />
            </KpiGrid>
            <p className="mt-2 text-sm">
              <Link href="/admin/contenido">Gestionar contenido →</Link>
            </p>
          </section>
        </div>
      </details>
    </div>
  );
}
