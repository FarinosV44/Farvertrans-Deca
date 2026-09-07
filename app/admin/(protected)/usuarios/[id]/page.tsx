import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserAdmin } from "@/lib/admin/records";
import { AccountActions } from "@/components/admin/account-actions";
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

export default async function AdminUsuarioDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await getUserAdmin(id);
  if (!u) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      <BackLink href="/admin/usuarios">Usuarios</BackLink>
      <PageHeader
        title={u.email}
        lead={`${u.provider === "google" ? "Google" : "email"} · ${u.createdDeca} DeCA creados`}
      />

      <AccountActions
        kind="usuarios"
        id={u.id}
        status={u.status as "active" | "blocked" | "deactivated" | "anonymized"}
        reason={u.statusReason}
        name={u.email}
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <DefinitionList
          items={[
            {
              label: "Rol",
              value: u.role === "internal" ? <Badge tone="yellow">interno</Badge> : "cliente",
            },
            {
              label: "Rol en la empresa",
              value: u.companyRole === "owner" ? "administrador" : "miembro",
            },
            {
              label: "Empresa",
              value: u.company ? (
                <Link href={`/admin/empresas/${u.company.id}`} className="no-underline">
                  {u.company.name} {u.company.status !== "active" ? `(${u.company.status})` : ""}
                </Link>
              ) : (
                "—"
              ),
            },
            {
              label: "Email verificado",
              value: u.emailVerifiedAt ? (
                <Badge tone="green">verificado</Badge>
              ) : (
                <Badge tone="muted">pendiente</Badge>
              ),
            },
            { label: "Alta", value: fmt(u.createdAt) },
            { label: "Cambio de estado", value: fmt(u.statusChangedAt) },
            { label: "Anonimizado", value: fmt(u.anonymizedAt) },
          ]}
        />
      </div>

      <section aria-labelledby="aud">
        <h2 id="aud" className="mb-2 text-sm font-bold">
          Actividad de auditoría
        </h2>
        {u.audit.length === 0 ? (
          <Empty>Sin eventos de auditoría.</Empty>
        ) : (
          <Table head={["Fecha", "Acción", "Como", "Resultado"]}>
            {u.audit.map((a, i) => (
              <Row key={i}>
                <Cell mono>{fmt(a.at)}</Cell>
                <Cell>{a.action}</Cell>
                <Cell>{a.role === "actor" ? "actor" : "objetivo"}</Cell>
                <Cell>
                  {a.result === "success" ? (
                    <Badge tone="green">ok</Badge>
                  ) : (
                    <Badge tone="muted">{a.result}</Badge>
                  )}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
