import Link from "next/link";
import { overviewMetrics, operationalAlerts, contentStats } from "@/lib/admin/metrics";
import { PageHeader, Kpi, KpiGrid, Badge } from "@/components/admin/ui";
import { SEO_PAGES } from "@/content/seo/pages";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

export default async function AdminOverview() {
  const [metrics, alerts, content] = await Promise.all([
    overviewMetrics(),
    operationalAlerts(),
    contentStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen"
        lead="Estado operativo del producto: generación de DeCA, empresas activas, captación y salud del sistema."
      />

      <section aria-labelledby="alertas">
        <h2 id="alertas" className="mb-2 text-sm font-bold">
          Alertas operativas
        </h2>
        {alerts.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text-muted)]">
            Sin alertas. La generación funciona y las dependencias responden.
          </div>
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

      {metrics.windows.map((w) => (
        <section key={w.window} aria-labelledby={`w-${w.window}`}>
          <h2 id={`w-${w.window}`} className="mb-2 text-sm font-bold">
            {w.window === "today"
              ? "Hoy"
              : w.window === "7d"
                ? "Últimos 7 días"
                : "Últimos 30 días"}
          </h2>
          <KpiGrid>
            <Kpi label="DeCA generados" value={w.decaGenerated} />
            <Kpi
              label="Tasa de éxito"
              value={pct(w.successRate)}
              sub={`${w.decaFailed} intentos fallidos`}
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

      <section aria-labelledby="acq">
        <h2 id="acq" className="mb-2 text-sm font-bold">
          Captación
        </h2>
        <KpiGrid>
          <Kpi
            label="Prospectos por activar"
            value={metrics.acquisition.prospectsAwaitingActivation}
          />
          <Kpi
            label="Operador líder"
            value={metrics.acquisition.topRefCode?.code ?? "—"}
            sub={
              metrics.acquisition.topRefCode
                ? `${metrics.acquisition.topRefCode.companies} empresas`
                : "sin datos"
            }
          />
          <Kpi
            label="Fuente líder"
            value={metrics.acquisition.topSource?.source ?? "—"}
            sub={
              metrics.acquisition.topSource
                ? `${metrics.acquisition.topSource.count} altas`
                : "sin datos"
            }
          />
          <Kpi label="Fallos sin resolver" value={metrics.totals.unresolvedFailures} />
        </KpiGrid>
      </section>

      <section aria-labelledby="tot">
        <h2 id="tot" className="mb-2 text-sm font-bold">
          Totales
        </h2>
        <KpiGrid>
          <Kpi label="Empresas" value={metrics.totals.companies} />
          <Kpi label="Usuarios" value={metrics.totals.users} />
          <Kpi label="DeCA (histórico)" value={metrics.totals.deca} />
        </KpiGrid>
      </section>

      <section aria-labelledby="content">
        <h2 id="content" className="mb-2 text-sm font-bold">
          Contenido / SEO
        </h2>
        <KpiGrid>
          <Kpi label="Guías publicadas" value={content.guidesPublished} />
          <Kpi label="Blog publicados" value={content.blogPublished} />
          <Kpi label="Borradores" value={content.drafts} sub="pendientes de revisar" />
          <Kpi label="Clics CTA desde contenido (30d)" value={content.ctaClicks30d} />
          <Kpi label="Clúster SEO en código" value={SEO_PAGES.length} />
        </KpiGrid>
        <p className="mt-2 text-sm">
          <Link href="/admin/contenido">Gestionar guías y blog →</Link>
        </p>
      </section>
    </div>
  );
}
