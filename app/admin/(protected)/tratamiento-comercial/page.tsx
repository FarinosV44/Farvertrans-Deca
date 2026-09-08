import {
  commercialModeCounts,
  recentAvailabilityShares,
  recentCommercialEvents,
} from "@/lib/admin/commercial";
import { PageHeader, Table, Row, Cell, Empty, KpiGrid, Kpi } from "@/components/admin/ui";

/**
 * Commercial-treatment visibility (#84). Read-only: the mode split, the
 * prepared availability records, and the consent-event trail. Nothing is
 * transmitted anywhere — a record sits at `pending` until withdrawn.
 */
export default async function AdminTratamientoComercial() {
  const [counts, shares, events] = await Promise.all([
    commercialModeCounts(),
    recentAvailabilityShares(50),
    recentCommercialEvents(60),
  ]);

  const t = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tratamiento comercial"
        lead="Preferencia de compartición por empresa, fichas de disponibilidad preparadas y registro de consentimiento (#84). Solo lectura — nada se comunica a terceros todavía."
      />

      <KpiGrid>
        <Kpi label="No autorizado" value={counts.none} sub={`de ${counts.total} empresas`} />
        <Kpi label="Por porte" value={counts.per_deca} />
        <Kpi label="Todos los portes" value={counts.all} />
      </KpiGrid>

      <section>
        <h2 className="mb-2 text-sm font-bold">Fichas de disponibilidad preparadas</h2>
        {shares.length === 0 ? (
          <Empty>Ninguna ficha preparada.</Empty>
        ) : (
          <Table
            head={["Empresa", "Destino", "Disponibilidad", "Canal", "Estado", "Preparada (UTC)"]}
          >
            {shares.map((s) => (
              <Row key={s.decaId}>
                <Cell>{s.companyName}</Cell>
                <Cell>{s.destination}</Cell>
                <Cell mono>{s.availabilityDate.toISOString().slice(0, 10)}</Cell>
                <Cell>{s.channel}</Cell>
                <Cell>{s.status}</Cell>
                <Cell mono>{t(s.preparedAt)}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold">Registro de consentimiento</h2>
        {events.length === 0 ? (
          <Empty>Sin eventos.</Empty>
        ) : (
          <Table head={["Empresa", "Evento", "Modo", "Canal", "Versión legal", "Fecha (UTC)"]}>
            {events.map((e, i) => (
              <Row key={i}>
                <Cell>{e.companyName}</Cell>
                <Cell>{e.kind}</Cell>
                <Cell>{e.mode ?? "—"}</Cell>
                <Cell>{e.channel ?? "—"}</Cell>
                <Cell mono>{e.legalVersion}</Cell>
                <Cell mono>{t(e.createdAt)}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
