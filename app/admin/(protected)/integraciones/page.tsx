import Link from "next/link";
import { listIntegrationRequests } from "@/lib/integrations";
import { PageHeader, Table, Row, Cell, Empty } from "@/components/admin/ui";
import { IntegrationStatus } from "@/components/admin/integration-status";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

/** #74 — which systems and needs repeat most → what to build first. */
export default async function AdminIntegraciones() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const rows = await listIntegrationRequests();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Integraciones"
        lead="Solicitudes de conexión con TMS/ERP. Sirven para priorizar; no se emiten claves aquí."
      />
      {rows.length === 0 ? (
        <Empty>Ninguna solicitud todavía.</Empty>
      ) : (
        <Table
          head={[
            "Empresa",
            "Sistema",
            "Necesidad",
            "Contacto",
            "DeCA 30d",
            "Volumen",
            "Fecha",
            "Estado",
          ]}
        >
          {rows.map((r) => (
            <Row key={r.id}>
              <Cell>
                <Link href={`/admin/empresas/${r.companyId}`} className="font-medium">
                  {r.companyName}
                </Link>
              </Cell>
              <Cell>{r.system}</Cell>
              <Cell>{r.need}</Cell>
              <Cell>{r.contact ?? "—"}</Cell>
              <Cell mono>{r.deca30d}</Cell>
              <Cell>{r.volumeNote ?? "—"}</Cell>
              <Cell mono>{r.createdAt.toISOString().slice(0, 10)}</Cell>
              <Cell>
                <IntegrationStatus id={r.id} status={r.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
