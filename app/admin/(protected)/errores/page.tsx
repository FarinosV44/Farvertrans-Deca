import Link from "next/link";
import { listFailures, failureStageCounts } from "@/lib/admin/failures";
import { GENERATION_STAGES } from "@/lib/deca/generation";
import { rangeFromParam } from "@/lib/admin/range";
import { PageHeader, Table, Row, Cell, Badge, Empty, KpiGrid, Kpi } from "@/components/admin/ui";

const STAGE_TONE: Record<string, string> = {
  validation: "muted",
  configuration: "red",
  pdf_render: "yellow",
  pdf_storage: "red",
  database: "red",
  unknown: "yellow",
};

const fmt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

type SP = { [k: string]: string | string[] | undefined };

export default async function AdminErrores({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const range = rangeFromParam(one("range"));
  const stage = one("stage");
  const status = one("status") as "unresolved" | "resolved" | "recovered" | undefined;

  const [rows, counts] = await Promise.all([
    listFailures({ stage, status, since: range.since }),
    failureStageCounts(range.since),
  ]);

  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { range: range.value, stage, status, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    return `/admin/errores?${p.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Errores de generación"
        lead="Fallos clasificados por etapa desde #29. Pide al cliente el código de 6 caracteres y localiza el fallo exacto — sin SSH, sin consultas a la base de datos."
      />

      <KpiGrid>
        {GENERATION_STAGES.map((s) => (
          <Kpi key={s} label={s} value={counts[s] ?? 0} sub={`en ${range.label}`} />
        ))}
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
        <span className="mx-1 text-[var(--color-border)]">|</span>
        <Link
          href={link({ stage: undefined })}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 no-underline"
        >
          Todas las etapas
        </Link>
        {GENERATION_STAGES.map((s) => (
          <Link
            key={s}
            href={link({ stage: s })}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${
              stage === s
                ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {s}
          </Link>
        ))}
        <span className="mx-1 text-[var(--color-border)]">|</span>
        {(["unresolved", "resolved", "recovered"] as const).map((st) => (
          <Link
            key={st}
            href={link({ status: status === st ? undefined : st })}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${
              status === st
                ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {st === "unresolved" ? "sin resolver" : st === "resolved" ? "resueltos" : "recuperados"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty>
          Ningún fallo con estos filtros.{" "}
          {counts && Object.keys(counts).length === 0
            ? "No se ha registrado ningún fallo de generación en este periodo."
            : ""}
        </Empty>
      ) : (
        <Table head={["Fecha (UTC)", "Código", "Etapa", "Origen", "Clase", "Estado"]}>
          {rows.map((r) => (
            <Row key={r.id}>
              <Cell mono>{fmt(r.createdAt)}</Cell>
              <Cell>
                <Link
                  href={`/admin/errores/${r.correlationId}`}
                  className="font-mono font-medium no-underline"
                  data-testid="failure-link"
                >
                  {r.correlationId}
                </Link>
              </Cell>
              <Cell>
                <Badge tone={STAGE_TONE[r.stage] ?? "muted"}>{r.stage}</Badge>
              </Cell>
              <Cell>{r.authenticated ? "con cuenta" : "anónimo"}</Cell>
              <Cell mono>{r.errorClass}</Cell>
              <Cell>
                {r.retriedOk ? (
                  <Badge tone="green">recuperado</Badge>
                ) : r.resolvedAt ? (
                  <Badge tone="muted">resuelto</Badge>
                ) : (
                  <Badge tone="yellow">abierto</Badge>
                )}
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
