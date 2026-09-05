import Link from "next/link";
import { notFound } from "next/navigation";
import { getDecaAdmin } from "@/lib/admin/records";
import {
  PageHeader,
  DefinitionList,
  Badge,
  BackLink,
  Table,
  Row,
  Cell,
} from "@/components/admin/ui";

const fmt = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—");

export default async function AdminDecaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDecaAdmin(id);
  if (!d) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      <BackLink href="/admin/deca">DeCA</BackLink>
      <PageHeader
        title={d.reference}
        lead={`${d.route} · ${d.scope}`}
        action={
          d.company ? (
            <Link href={`/admin/empresas/${d.company.id}`} className="text-sm no-underline">
              {d.company.name} →
            </Link>
          ) : (
            <Badge tone="muted">anónimo</Badge>
          )
        }
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <DefinitionList
          items={[
            { label: "Creado", value: fmt(d.createdAt) },
            { label: "Servicio", value: `${fmt(d.serviceStart)} → ${fmt(d.serviceEnd)}` },
            {
              label: "Empresa",
              value: d.company ? `${d.company.name} (${d.company.nif ?? "sin NIF"})` : "—",
            },
            { label: "Creador", value: d.creator ?? "—" },
            { label: "Cargador", value: d.parties.shipper || "—" },
            { label: "Transportista", value: d.parties.carrier || "—" },
            { label: "Mercancía", value: d.goodsSummary || "—" },
            { label: "Versión actual", value: `v${d.current.versionNo}` },
            {
              label: "Hash PDF (SHA-256)",
              value: <span className="font-mono text-xs">{d.current.pdfSha256 || "—"}</span>,
            },
            {
              label: "Clave de almacén",
              value: (
                <span className="font-mono text-xs">{d.current.pdfPath ?? "sin almacenar"}</span>
              ),
            },
            {
              label: "URL pública / inspección",
              value: (
                <a
                  href={d.current.publicUrl}
                  className="font-mono text-xs"
                  target="_blank"
                  rel="noreferrer"
                >
                  {d.current.publicUrl}
                </a>
              ),
            },
            {
              label: "Reclamación (anónimo)",
              value: d.claim
                ? `${d.claim.used ? "usada" : "pendiente"} · caduca ${fmt(d.claim.expiresAt)}`
                : "—",
            },
          ]}
        />
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a href={d.current.publicUrl} target="_blank" rel="noreferrer" className="no-underline">
            Abrir PDF actual →
          </a>
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          El contenido legal de un DeCA generado no se edita desde administración (#33). Las
          correcciones crean siempre una versión nueva desde el panel del cliente.
        </p>
      </div>

      <section aria-labelledby="ver">
        <h2 id="ver" className="mb-2 text-sm font-bold">
          Versiones ({d.versions.length})
        </h2>
        <Table head={["Ver.", "Creada", "Autor", "Motivo", "Hash", "URL"]}>
          {d.versions.map((v) => (
            <Row key={v.versionNo}>
              <Cell>
                v{v.versionNo}
                {v.isCurrent && <Badge tone="green">actual</Badge>}
              </Cell>
              <Cell mono>{fmt(v.createdAt)}</Cell>
              <Cell>{v.author ?? "—"}</Cell>
              <Cell>{v.changeReason ?? "—"}</Cell>
              <Cell mono>{v.pdfSha256.slice(0, 12) || "—"}</Cell>
              <Cell>
                <a
                  href={v.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs no-underline"
                >
                  abrir
                </a>
              </Cell>
            </Row>
          ))}
        </Table>
      </section>

      {d.acquisition && (
        <section aria-labelledby="acq">
          <h2 id="acq" className="mb-2 text-sm font-bold">
            Atribución de la empresa
          </h2>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <DefinitionList
              items={[
                { label: "Ref. primer contacto", value: d.acquisition.firstRefCode ?? "—" },
                { label: "Ref. último contacto", value: d.acquisition.lastRefCode ?? "—" },
                { label: "Fuente (UTM)", value: d.acquisition.firstUtmSource ?? "—" },
                { label: "Campaña (UTM)", value: d.acquisition.firstUtmCampaign ?? "—" },
                { label: "Alta", value: fmt(d.acquisition.signupAt) },
                { label: "Primer DeCA", value: fmt(d.acquisition.firstDecaAt) },
              ]}
            />
          </div>
        </section>
      )}
    </div>
  );
}
