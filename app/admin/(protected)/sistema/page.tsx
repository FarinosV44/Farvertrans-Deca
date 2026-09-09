import Link from "next/link";
import { runDiagnostics } from "@/lib/diagnostics";
import { generationHealth } from "@/lib/admin/metrics";
import { listFailures } from "@/lib/admin/failures";
import { APP_VERSION } from "@/lib/version";
import { PageHeader, Badge, DefinitionList, Table, Row, Cell, Empty } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

const TONE: Record<string, string> = { ok: "green", warn: "yellow", fail: "red", skipped: "muted" };
const pct = (v: number | null) => (v === null ? "sin datos" : `${Math.round(v * 100)}%`);
const ago = (min: number | null) =>
  min === null
    ? "—"
    : min < 60
      ? `hace ${min} min`
      : min < 1440
        ? `hace ${Math.round(min / 60)} h`
        : `hace ${Math.round(min / 1440)} d`;

export default async function AdminSistema() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const [report, health, incidents] = await Promise.all([
    runDiagnostics(),
    generationHealth(),
    listFailures({}, 15),
  ]);
  const googleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const genState =
    health.consecutiveFailures >= 3 || health.lastSuccessStale
      ? { tone: "red", text: "Atención" }
      : health.rate24h !== null && health.rate24h < 0.8
        ? { tone: "yellow", text: "Degradado" }
        : { tone: "green", text: "Correcto" };

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="Sistema"
        lead="Preparación y salud del despliegue. Los mismos comprobantes que ejecuta `npm run diagnose -- <url>` tras cada deploy."
        action={
          <Badge tone={report.ok ? "green" : "red"}>
            {report.ok ? "Todo correcto" : "Requiere atención"}
          </Badge>
        }
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <DefinitionList
          items={[
            { label: "Versión", value: APP_VERSION },
            { label: "Entorno", value: report.environment },
            { label: "Node", value: report.node },
            { label: "Almacén configurado", value: report.storage },
            {
              label: "URL pública",
              value: <span className="font-mono text-xs">{report.baseUrl || "—"}</span>,
            },
            {
              label: "Google OAuth",
              value: googleConfigured ? "configurado" : "sin configurar (#30)",
            },
            {
              label: "Generado",
              value: report.generatedAt.replace("T", " ").slice(0, 19) + " UTC",
            },
          ]}
        />
      </div>

      <section aria-labelledby="gen">
        <h2 id="gen" className="mb-2 flex items-center gap-2 text-sm font-bold">
          Generación de DeCA
          <Badge tone={genState.tone}>{genState.text}</Badge>
        </h2>
        <div
          className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:grid-cols-2"
          data-testid="generation-health"
        >
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Última generación correcta</p>
            <p className="mt-0.5 text-sm font-medium">
              {ago(health.lastSuccessAgeMin)}
              {health.lastSuccessStale && (
                <span className="ml-2 text-[var(--color-danger)]">demasiado antigua</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Tasa de éxito 24 h / 7 d</p>
            <p className="mt-0.5 text-sm font-medium">
              {pct(health.rate24h)} / {pct(health.rate7d)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Intentos 24 h</p>
            <p className="mt-0.5 text-sm font-medium">
              {health.attempts24h} ({health.failed24h} fallidos)
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Fallos consecutivos</p>
            <p className="mt-0.5 text-sm font-medium">
              {health.consecutiveFailures}
              {health.consecutiveFailures >= 3 && (
                <span className="ml-2 text-[var(--color-danger)]">racha de fallos</span>
              )}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="inc">
        <h2 id="inc" className="mb-2 text-sm font-bold">
          Incidencias recientes
        </h2>
        {incidents.length === 0 ? (
          <Empty>Sin incidencias registradas.</Empty>
        ) : (
          <Table head={["Fecha", "Etapa", "Código", "Resumen", "Estado", ""]}>
            {incidents.map((f) => (
              <Row key={f.id}>
                <Cell mono>{f.createdAt.toISOString().replace("T", " ").slice(0, 16)}</Cell>
                <Cell>{f.stage}</Cell>
                <Cell mono>{f.correlationId}</Cell>
                <Cell>{f.message}</Cell>
                <Cell>
                  <Badge tone={f.retriedOk ? "green" : f.resolvedAt ? "muted" : "yellow"}>
                    {f.retriedOk ? "Recuperado" : f.resolvedAt ? "Resuelto" : "Pendiente"}
                  </Badge>
                </Cell>
                <Cell>
                  <Link href={`/admin/errores/${f.correlationId}`}>Detalle</Link>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
        <p className="mt-1 text-sm">
          <Link href="/admin/errores">Ver todas las incidencias →</Link>
        </p>
      </section>

      <ul className="space-y-2">
        {report.checks.map((c) => (
          <li
            key={c.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{c.label}</span>
              <div className="flex items-center gap-2">
                {c.ms !== undefined && (
                  <span className="text-xs text-[var(--color-text-muted)]">{c.ms} ms</span>
                )}
                <Badge tone={TONE[c.state] ?? "muted"}>{c.state}</Badge>
              </div>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{c.detail}</p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--color-text-muted)]">
        Ningún dato de esta pantalla es un secreto: sólo si cada dependencia responde. Nunca se
        muestran claves, contraseñas ni cadenas de conexión.
      </p>
    </div>
  );
}
