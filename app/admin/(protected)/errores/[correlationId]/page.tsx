import { notFound } from "next/navigation";
import { getFailure } from "@/lib/admin/failures";
import { stageMessage, type GenerationStage } from "@/lib/deca/generation";
import { PageHeader, DefinitionList, Badge, BackLink } from "@/components/admin/ui";
import { FailureTriage } from "@/components/admin/failure-triage";
import { requireInternal } from "@/lib/admin/guard";

const fmt = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—");

export default async function FailureDetail({
  params,
}: {
  params: Promise<{ correlationId: string }>;
}) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const { correlationId } = await params;
  const f = await getFailure(correlationId);
  if (!f) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <BackLink href="/admin/errores">Errores de generación</BackLink>
      <PageHeader
        title={`Fallo ${f.correlationId}`}
        lead={stageMessage(f.stage as GenerationStage)}
        action={
          f.retriedOk ? (
            <Badge tone="green">recuperado por reintento</Badge>
          ) : f.resolvedAt ? (
            <Badge tone="muted">resuelto</Badge>
          ) : (
            <Badge tone="yellow">abierto</Badge>
          )
        }
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <DefinitionList
          items={[
            {
              label: "Código de correlación",
              value: <span className="font-mono">{f.correlationId}</span>,
            },
            { label: "Etapa", value: <Badge tone="muted">{f.stage}</Badge> },
            {
              label: "Clase de error",
              value: <span className="font-mono text-xs">{f.errorClass}</span>,
            },
            {
              label: "Mensaje (redactado)",
              value: <span className="font-mono text-xs">{f.message || "—"}</span>,
            },
            { label: "Origen", value: f.route ?? "—" },
            { label: "Sesión", value: f.authenticated ? "con cuenta" : "anónima" },
            { label: "Almacén", value: f.storageDriver ?? "—" },
            { label: "Versión de la app", value: f.appVersion ?? "—" },
            { label: "Ocurrió", value: fmt(f.createdAt) },
            { label: "Reintento correcto", value: f.retriedOk ? "sí" : "no" },
            { label: "Resuelto", value: fmt(f.resolvedAt) },
          ]}
        />
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          El registro nunca contiene el contenido del DeCA ni datos personales de terceros: sólo la
          etapa, un resumen redactado del error y metadatos de ejecución (RGPD / T-14).
        </p>
      </div>

      <FailureTriage
        correlationId={f.correlationId}
        initialNote={f.note ?? ""}
        initialResolved={!!f.resolvedAt}
      />
    </div>
  );
}
