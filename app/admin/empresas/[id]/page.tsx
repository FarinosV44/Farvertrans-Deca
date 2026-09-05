import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyAdmin } from "@/lib/admin/records";
import {
  PageHeader,
  DefinitionList,
  Badge,
  BackLink,
  Table,
  Row,
  Cell,
  Empty,
} from "@/components/admin/ui";

const fmt = (d: Date | null | undefined) =>
  d ? d.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—";

export default async function AdminEmpresaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCompanyAdmin(id);
  if (!c) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      <BackLink href="/admin/empresas">Empresas</BackLink>
      <PageHeader title={c.name} lead={`${c.nif ?? "sin NIF"} · ${c.totalDeca} DeCA`} />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <DefinitionList
          items={[
            { label: "NIF", value: c.nif ?? "—" },
            { label: "Dirección", value: c.address ?? "—" },
            { label: "Contacto", value: c.contactName ?? "—" },
            { label: "Teléfono", value: c.phone ?? "—" },
            { label: "Perfil", value: c.profile ?? "—" },
            { label: "Alta", value: fmt(c.createdAt) },
            { label: "Miembros", value: String(c.members.length) },
            {
              label: "DeCA",
              value: `${c.totalDeca} totales · ${c.decaCounts.d7} (7d) · ${c.decaCounts.d30} (30d) · ${c.decaCounts.d90} (90d)`,
            },
            { label: "Última actividad", value: fmt(c.lastDecaAt) },
            {
              label: "Datos guardados",
              value: `${c.saved.companies} cargadores · ${c.saved.vehicles} vehículos · ${c.saved.locations} lugares`,
            },
            { label: "Primer DeCA", value: fmt(c.acquisition?.firstDecaAt) },
            { label: "Operador (first-touch)", value: c.acquisition?.firstRefCode ?? "—" },
            { label: "Operador (last-touch)", value: c.acquisition?.lastRefCode ?? "—" },
            { label: "Fuente (UTM)", value: c.acquisition?.firstUtmSource ?? "—" },
            {
              label: "Términos aceptados",
              value: c.terms ? `v${c.terms.version} · ${fmt(c.terms.acceptedAt)}` : "—",
            },
            {
              label: "Consentimiento comercial",
              value: c.commercialConsent
                ? c.commercialConsent.granted
                  ? `Autorizado (v${c.commercialConsent.version} · ${fmt(c.commercialConsent.grantedAt)})`
                  : `Revocado (${fmt(c.commercialConsent.revokedAt)})`
                : "No solicitado",
            },
          ]}
        />
      </div>

      <section aria-labelledby="mem">
        <h2 id="mem" className="mb-2 text-sm font-bold">
          Miembros
        </h2>
        <Table head={["Email", "Proveedor", "Rol workspace", "Rol", "Email verificado", "Alta"]}>
          {c.members.map((m) => (
            <Row key={m.id}>
              <Cell>
                <Link
                  href={`/admin/usuarios?q=${encodeURIComponent(m.email)}`}
                  className="no-underline"
                >
                  {m.email}
                </Link>
              </Cell>
              <Cell>
                {m.role === "internal" ? <Badge tone="yellow">interno</Badge> : "cliente"}
              </Cell>
              <Cell>{m.companyRole === "owner" ? "administrador" : "miembro"}</Cell>
              <Cell>{m.role}</Cell>
              <Cell>
                {m.emailVerifiedAt ? (
                  <Badge tone="green">verificado</Badge>
                ) : (
                  <Badge tone="muted">pendiente</Badge>
                )}
              </Cell>
              <Cell mono>{fmt(m.createdAt)}</Cell>
            </Row>
          ))}
        </Table>
      </section>

      <section aria-labelledby="inv">
        <h2 id="inv" className="mb-2 text-sm font-bold">
          Invitaciones
        </h2>
        {c.invites.length === 0 ? (
          <Empty>Sin invitaciones.</Empty>
        ) : (
          <Table head={["Email", "Rol", "Estado", "Creada"]}>
            {c.invites.map((iv, i) => (
              <Row key={i}>
                <Cell>{iv.email}</Cell>
                <Cell>{iv.role === "owner" ? "administrador" : "miembro"}</Cell>
                <Cell>
                  {iv.acceptedAt ? (
                    <Badge tone="green">aceptada</Badge>
                  ) : iv.expiresAt < new Date() ? (
                    <Badge tone="muted">caducada</Badge>
                  ) : (
                    <Badge tone="yellow">pendiente</Badge>
                  )}
                </Cell>
                <Cell mono>{fmt(iv.createdAt)}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>

      <section aria-labelledby="dec">
        <h2 id="dec" className="mb-2 text-sm font-bold">
          DeCA recientes
        </h2>
        {c.recentDeca.length === 0 ? (
          <Empty>Esta empresa aún no ha generado ningún DeCA.</Empty>
        ) : (
          <Table head={["Referencia", "Creado", "Versión"]}>
            {c.recentDeca.map((d) => (
              <Row key={d.id}>
                <Cell>
                  <Link href={`/admin/deca/${d.id}`} className="font-mono no-underline">
                    {d.reference}
                  </Link>
                </Cell>
                <Cell mono>{fmt(d.createdAt)}</Cell>
                <Cell>v{d.versionNo}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
