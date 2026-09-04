import Link from "next/link";
import { acquisitionFunnel, listProspects } from "@/lib/growth";
import { ProspectManager } from "@/components/app/prospect-manager";
import { PageHeader, Table, Row, Cell } from "@/components/admin/ui";

export default async function AdminCaptacion() {
  const [{ byOperator, totals }, prospects] = await Promise.all([
    acquisitionFunnel(),
    listProspects(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Captación"
        lead="Embudo prospecto → registro → primer DeCA por operador. La métrica clave es empresa → primer DeCA, no el número de leads."
        action={
          <Link href="/admin/operadores" className="text-sm no-underline">
            Métricas de uso →
          </Link>
        }
      />

      <section aria-labelledby="funnel">
        <h2 id="funnel" className="mb-2 text-sm font-bold">
          Embudo por operador
        </h2>
        <Table
          head={[
            "Operador",
            "Prospectos",
            "Invitados",
            "Registrados",
            "Activadas (1er DeCA)",
            "Activas 7d",
            "DeCA totales",
          ]}
        >
          {byOperator.map((f) => (
            <Row key={f.refCode}>
              <Cell>{f.refCode}</Cell>
              <Cell>{f.prospects}</Cell>
              <Cell>{f.invited}</Cell>
              <Cell>{f.registered}</Cell>
              <Cell>
                <strong>{f.activated}</strong>
              </Cell>
              <Cell>{f.active7d}</Cell>
              <Cell>{f.totalDeca}</Cell>
            </Row>
          ))}
          <Row>
            <Cell>
              <strong>{totals.refCode}</strong>
            </Cell>
            <Cell>
              <strong>{totals.prospects}</strong>
            </Cell>
            <Cell>
              <strong>{totals.invited}</strong>
            </Cell>
            <Cell>
              <strong>{totals.registered}</strong>
            </Cell>
            <Cell>
              <strong>{totals.activated}</strong>
            </Cell>
            <Cell>
              <strong>{totals.active7d}</strong>
            </Cell>
            <Cell>
              <strong>{totals.totalDeca}</strong>
            </Cell>
          </Row>
        </Table>
      </section>

      <section aria-labelledby="prospectos">
        <h2 id="prospectos" className="mb-2 text-sm font-bold">
          Prospectos
        </h2>
        <ProspectManager
          prospects={prospects.map((p) => ({
            id: p.id,
            name: p.name,
            nif: p.nif,
            email: p.email,
            refCode: p.refCode,
            status: p.status,
            registeredAt: p.registeredAt?.toISOString() ?? null,
            firstDecaAt: p.firstDecaAt?.toISOString() ?? null,
            lastDecaAt: p.lastDecaAt?.toISOString() ?? null,
          }))}
        />
      </section>
    </div>
  );
}
