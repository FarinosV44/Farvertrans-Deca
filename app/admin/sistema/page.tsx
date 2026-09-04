import { runDiagnostics } from "@/lib/diagnostics";
import { APP_VERSION } from "@/lib/version";
import { PageHeader, Badge, DefinitionList } from "@/components/admin/ui";

const TONE: Record<string, string> = { ok: "green", warn: "yellow", fail: "red", skipped: "muted" };

export default async function AdminSistema() {
  const report = await runDiagnostics();
  const googleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

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
