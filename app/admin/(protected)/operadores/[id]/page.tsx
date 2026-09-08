import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Table, Row, Cell, Empty } from "@/components/admin/ui";
import { getOperator } from "@/lib/admin/operators";

export default async function AdminOperadorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOperator(id);
  if (!data) notFound();
  const { operator, link, companies, totals } = data;

  return (
    <div className="space-y-5">
      <Link href="/admin/operadores" className="text-sm text-[var(--color-primary)] underline">
        ← Operadores
      </Link>
      <PageHeader
        title={`${operator.name} ${operator.lastName ?? ""}`.trim()}
        lead={`Código ${operator.refCode} · ${operator.active ? "activo" : "inactivo"} · alta ${operator.createdAt.toISOString().slice(0, 10)}`}
      />

      <dl className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium text-[var(--color-text-muted)]">Enlace individual</dt>
          <dd className="font-mono break-all">{link}</dd>
        </div>
        {operator.email && (
          <div className="flex gap-2">
            <dt className="font-medium text-[var(--color-text-muted)]">Email</dt>
            <dd>{operator.email}</dd>
          </div>
        )}
        {operator.phone && (
          <div className="flex gap-2">
            <dt className="font-medium text-[var(--color-text-muted)]">Teléfono</dt>
            <dd>{operator.phone}</dd>
          </div>
        )}
        {operator.notes && (
          <div className="flex gap-2">
            <dt className="font-medium text-[var(--color-text-muted)]">Notas</dt>
            <dd className="whitespace-pre-wrap">{operator.notes}</dd>
          </div>
        )}
        <div className="flex gap-4 pt-2">
          <span>
            <strong>{totals.companies}</strong> empresas
          </span>
          <span>
            <strong>{totals.withDeca}</strong> con DeCA
          </span>
          <span>
            <strong>{totals.deca}</strong> DeCA totales
          </span>
        </div>
      </dl>

      <section>
        <h2 className="mb-2 text-sm font-bold">Empresas atribuidas a este enlace</h2>
        {companies.length === 0 ? (
          <Empty>Aún no se ha registrado ninguna empresa con este enlace.</Empty>
        ) : (
          <Table head={["Empresa", "Usuario principal", "Estado", "Registro", "1er DeCA", "DeCA"]}>
            {companies.map((c) => (
              <Row key={c.id}>
                <Cell>{c.name}</Cell>
                <Cell>{c.primaryUser ?? "—"}</Cell>
                <Cell>{c.status}</Cell>
                <Cell mono>{c.signupAt ? c.signupAt.toISOString().slice(0, 10) : "—"}</Cell>
                <Cell mono>{c.firstDecaAt ? c.firstDecaAt.toISOString().slice(0, 10) : "—"}</Cell>
                <Cell mono>{c.decaCount}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>

      <p className="text-xs text-[var(--color-text-muted)]">
        La atribución es first-touch y permanente (#11): se guarda al crear la cuenta, no depende de
        cookies. El modelo de datos está preparado para añadir comisiones (por alta, por cliente de
        pago, periodos de liquidación, estado pagado/no pagado, exportación) sin migración de lo ya
        registrado.
      </p>
    </div>
  );
}
