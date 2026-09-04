import Link from "next/link";
import { SEO_PAGES } from "@/content/seo/pages";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";

export default async function AdminContenido() {
  const pages = SEO_PAGES;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contenido"
        lead="Las páginas SEO actuales son estáticas (generadas del código). La gestión editorial de Guías y Blog — borradores, publicación, revisión, enlazado interno — llega con SEO #32."
      />

      <Empty>
        Guías y Blog con panel de publicación: pendiente de <strong>SEO #32</strong>. Hasta entonces
        el contenido se edita en <code>content/seo/pages.ts</code> y se despliega con la app.
      </Empty>

      <section aria-labelledby="seo">
        <h2 id="seo" className="mb-2 text-sm font-bold">
          Páginas SEO publicadas ({pages.length})
        </h2>
        <Table head={["Slug", "Título", "Última revisión"]}>
          {pages.map((p) => (
            <Row key={p.slug}>
              <Cell mono>
                <Link href={`/${p.slug}`} className="no-underline" target="_blank" rel="noreferrer">
                  /{p.slug}
                </Link>
              </Cell>
              <Cell>{p.title}</Cell>
              <Cell mono>
                {p.lastReviewed ? p.lastReviewed : <Badge tone="yellow">sin fecha</Badge>}
              </Cell>
            </Row>
          ))}
        </Table>
      </section>
    </div>
  );
}
