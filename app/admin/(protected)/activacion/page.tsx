import Link from "next/link";
import { listCompanySegments, funnelFromSegments, companiesToContact } from "@/lib/admin/segments";
import { PageHeader, Kpi, KpiGrid, Table, Row, Cell, Empty } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");

const BUCKET_LABEL: Record<string, string> = {
  onboarding_stalled: "Onboarding parado",
  no_repeat: "Primer uso sin repetición",
  high_use: "Cuenta de alto uso",
  team: "Equipo / adopción",
};

/** #72 — the activation funnel + the actionable "companies to contact" list. */
export default async function ActivacionPage() {
  const segments = await listCompanySegments();
  const funnel = funnelFromSegments(segments);
  const toContact = companiesToContact(segments);
  const conv = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activación"
        lead="Del registro al uso recurrente. Reglas transparentes, sin scoring opaco."
      />

      <KpiGrid>
        <Kpi label="Registradas" value={funnel.registered} />
        <Kpi label="Perfil completo" value={funnel.profileComplete} />
        <Kpi
          label="1er DeCA"
          value={funnel.firstDeca}
          sub={conv(funnel.firstDeca, funnel.registered) + " del registro"}
        />
        <Kpi
          label="Repiten (2+)"
          value={funnel.repeated}
          sub={conv(funnel.repeated, funnel.firstDeca) + " del 1er DeCA"}
        />
        <Kpi label="Activas 7d" value={funnel.active7d} />
        <Kpi label="Activas 30d" value={funnel.active30d} />
      </KpiGrid>

      <section aria-labelledby="contact">
        <h2 id="contact" className="mb-2 text-sm font-bold">
          Empresas a contactar ({toContact.length})
        </h2>
        {toContact.length === 0 ? (
          <Empty>Nada pendiente ahora mismo.</Empty>
        ) : (
          <Table
            head={[
              "Empresa",
              "Contacto",
              "Alta",
              "Última actividad",
              "DeCA 7d/30d/tot",
              "Miembros",
              "Motivo",
              "",
            ]}
          >
            {toContact.map((c) => (
              <Row key={c.company.id + c.bucket}>
                <Cell>
                  <Link href={`/admin/empresas/${c.company.id}`} className="font-medium">
                    {c.company.name}
                  </Link>
                </Cell>
                <Cell>{c.company.contactName ?? c.company.email ?? "—"}</Cell>
                <Cell mono>{fmt(c.company.createdAt)}</Cell>
                <Cell mono>{fmt(c.company.lastDecaAt)}</Cell>
                <Cell mono>{`${c.company.d7}/${c.company.d30}/${c.company.total}`}</Cell>
                <Cell>{c.company.members}</Cell>
                <Cell>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {BUCKET_LABEL[c.bucket]}: {c.reason}
                  </span>
                </Cell>
                <Cell>
                  <Link href={`/admin/empresas/${c.company.id}`}>Ver empresa</Link>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>

      <p className="text-xs text-[var(--color-text-muted)]">
        No se envían correos automáticamente desde esta pantalla.
      </p>
    </div>
  );
}
