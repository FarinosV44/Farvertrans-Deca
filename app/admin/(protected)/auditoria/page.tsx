import Link from "next/link";
import { listAuditLog, distinctAuditActions } from "@/lib/admin/audit-log";
import { rangeFromParam } from "@/lib/admin/range";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

const fmt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

type SP = { [k: string]: string | string[] | undefined };

/**
 * Security/audit trail viewer (SECURITY #53, PRODUCT #56 "all sensitive
 * access and role changes are auditable"). The rows already existed in
 * `SecurityAuditLog` — this is the first screen that actually surfaces them
 * to an internal user instead of requiring a direct DB query.
 */
export default async function AdminAuditoria({ searchParams }: { searchParams: Promise<SP> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const range = rangeFromParam(one("range"));
  const action = one("action");
  const result = one("result") as "success" | "failure" | undefined;

  const [rows, actions] = await Promise.all([
    listAuditLog({ action, result, since: range.since }),
    distinctAuditActions(),
  ]);

  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { range: range.value, action, result, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    return `/admin/auditoria?${p.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Auditoría de seguridad"
        lead="Accesos de administrador, cambios de rol de equipo, invitaciones y otras acciones sensibles — registro de solo lectura, nunca editable."
      />

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
          href={link({ action: undefined })}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 no-underline"
        >
          Todas las acciones
        </Link>
        {actions.map((a) => (
          <Link
            key={a}
            href={link({ action: a })}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 font-mono no-underline ${
              action === a
                ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {a}
          </Link>
        ))}
        <span className="mx-1 text-[var(--color-border)]">|</span>
        {(["success", "failure"] as const).map((r) => (
          <Link
            key={r}
            href={link({ result: result === r ? undefined : r })}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${
              result === r
                ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {r === "success" ? "éxito" : "fallo"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty>Ningún evento con estos filtros.</Empty>
      ) : (
        <Table head={["Fecha (UTC)", "Actor", "Acción", "Objetivo", "Resultado", "Detalle"]}>
          {rows.map((r) => (
            <Row key={r.id}>
              <Cell mono>{fmt(r.createdAt)}</Cell>
              <Cell>
                {r.actorEmail ?? <span className="text-[var(--color-text-muted)]">—</span>}
              </Cell>
              <Cell mono>{r.action}</Cell>
              <Cell mono>
                {r.targetType ?? "—"}
                {r.targetId ? ` · ${r.targetId}` : ""}
              </Cell>
              <Cell>
                <Badge tone={r.result === "success" ? "green" : "red"}>
                  {r.result === "success" ? "éxito" : "fallo"}
                </Badge>
              </Cell>
              <Cell>{r.detail ?? <span className="text-[var(--color-text-muted)]">—</span>}</Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
