import Link from "next/link";
import { listCompaniesAdmin } from "@/lib/admin/records";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");
type SP = { [k: string]: string | string[] | undefined };

export default async function AdminEmpresas({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : (sp.q as string | undefined);
  const rows = await listCompaniesAdmin(q);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Empresas"
        lead="Cuentas de empresa registradas, su actividad y su operador de captación."
      />

      <form method="get" className="flex items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">
            Buscar por nombre o NIF
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            data-testid="empresa-search"
            className="mt-1 w-72 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
        >
          Buscar
        </button>
      </form>

      {rows.length === 0 ? (
        <Empty>Ninguna empresa{q ? ` para "${q}"` : ""}.</Empty>
      ) : (
        <Table
          head={[
            "Empresa",
            "NIF",
            "Alta",
            "Miembros",
            "DeCA",
            "Último DeCA",
            "Operador",
            "Activa 30d",
          ]}
        >
          {rows.map((c) => (
            <Row key={c.id}>
              <Cell>
                <Link
                  href={`/admin/empresas/${c.id}`}
                  className="font-medium no-underline"
                  data-testid="empresa-row-link"
                >
                  {c.name}
                </Link>
              </Cell>
              <Cell mono>{c.nif ?? "—"}</Cell>
              <Cell mono>{fmt(c.createdAt)}</Cell>
              <Cell>{c.members}</Cell>
              <Cell>{c.totalDeca}</Cell>
              <Cell mono>{fmt(c.lastDecaAt)}</Cell>
              <Cell>{c.refCode ?? "—"}</Cell>
              <Cell>
                {c.active30d ? <Badge tone="green">sí</Badge> : <Badge tone="muted">no</Badge>}
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
