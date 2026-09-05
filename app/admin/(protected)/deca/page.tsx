import Link from "next/link";
import { listDecaAdmin, type DecaAdminFilter } from "@/lib/admin/records";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";

const fmt = (d: Date) => d.toISOString().slice(0, 10);
type SP = { [k: string]: string | string[] | undefined };

export default async function AdminDeca({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const filter: DecaAdminFilter = {
    q: one("q"),
    scope: one("scope") as DecaAdminFilter["scope"],
    status: one("status") as DecaAdminFilter["status"],
    corrected: one("corrected") as DecaAdminFilter["corrected"],
  };
  const rows = await listDecaAdmin(filter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="DeCA"
        lead="Todos los documentos generados, de cualquier empresa. Busca por referencia, empresa, cargador, transportista, origen o destino."
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={filter.q ?? ""}
            data-testid="deca-search"
            placeholder="DECA-… / empresa / ruta"
            className="mt-1 w-64 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">Ámbito</span>
          <select
            name="scope"
            defaultValue={filter.scope ?? ""}
            className="mt-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="authenticated">Con empresa</option>
            <option value="anonymous">Anónimos</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">Estado</span>
          <select
            name="status"
            defaultValue={filter.status ?? ""}
            className="mt-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm"
          >
            <option value="">Cualquiera</option>
            <option value="active">Activo</option>
            <option value="unavailable">No disponible</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">Versión</span>
          <select
            name="corrected"
            defaultValue={filter.corrected ?? ""}
            className="mt-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="current">Sin corregir</option>
            <option value="corrected">Corregidas</option>
          </select>
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
        >
          Filtrar
        </button>
      </form>

      {rows.length === 0 ? (
        <Empty>Ningún DeCA con estos filtros.</Empty>
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-muted)]">{rows.length} documentos</p>
          <Table
            head={[
              "Referencia",
              "Creado",
              "Servicio",
              "Ámbito",
              "Empresa",
              "Ruta",
              "Ver.",
              "Estado",
              "PDF",
            ]}
          >
            {rows.map((r) => (
              <Row key={r.id}>
                <Cell>
                  <Link
                    href={`/admin/deca/${r.id}`}
                    className="font-mono font-medium no-underline"
                    data-testid="deca-row-link"
                  >
                    {r.reference}
                  </Link>
                </Cell>
                <Cell mono>{fmt(r.createdAt)}</Cell>
                <Cell mono>{r.serviceDate || "—"}</Cell>
                <Cell>{r.scope}</Cell>
                <Cell>{r.companyName ?? "—"}</Cell>
                <Cell>{r.route}</Cell>
                <Cell>
                  {r.versionNo}
                  {r.corrected && (
                    <span className="ml-1 text-xs text-[var(--color-text-muted)]">corr.</span>
                  )}
                </Cell>
                <Cell>
                  <Badge tone={r.status === "activo" ? "green" : "muted"}>{r.status}</Badge>
                </Cell>
                <Cell>{r.pdfStored ? "✓" : <Badge tone="red">falta</Badge>}</Cell>
              </Row>
            ))}
          </Table>
        </>
      )}
    </div>
  );
}
