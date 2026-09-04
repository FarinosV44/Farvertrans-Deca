import Link from "next/link";
import { listContent, type ContentType, type ContentStatus } from "@/lib/content/cms";
import { SEO_PAGES } from "@/content/seo/pages";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";

type SP = { [k: string]: string | string[] | undefined };
const fmt = (d: Date) => d.toISOString().slice(0, 10);

const STATUS_TONE: Record<string, string> = {
  published: "green",
  draft: "yellow",
  archived: "muted",
};

export default async function AdminContenido({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const type = one("type") as ContentType | undefined;
  const status = one("status") as ContentStatus | undefined;
  const items = await listContent({ type, status });

  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, val] of Object.entries({ type, status, ...patch })) if (val) p.set(k, val);
    const qs = p.toString();
    return `/admin/contenido${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contenido"
        lead="Guías y blog publicados desde aquí, sin desplegar. El clúster SEO principal sigue en el código y no se toca desde este panel."
        action={
          <Link
            href="/admin/contenido/nuevo"
            className="min-h-10 self-start rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            Nuevo
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={link({ type: undefined })}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 no-underline"
        >
          Todo
        </Link>
        <Link
          href={link({ type: "guide" })}
          className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${type === "guide" ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]" : "border-[var(--color-border)]"}`}
        >
          Guías
        </Link>
        <Link
          href={link({ type: "blog" })}
          className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${type === "blog" ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]" : "border-[var(--color-border)]"}`}
        >
          Blog
        </Link>
        <span className="mx-1 text-[var(--color-border)]">|</span>
        {(["draft", "published", "archived"] as const).map((s) => (
          <Link
            key={s}
            href={link({ status: status === s ? undefined : s })}
            className={`rounded-[var(--radius-sm)] border px-2 py-1 no-underline ${status === s ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]" : "border-[var(--color-border)]"}`}
          >
            {s === "draft" ? "borradores" : s === "published" ? "publicados" : "archivados"}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <Empty>Ningún contenido con estos filtros. Empieza con «Nuevo».</Empty>
      ) : (
        <Table head={["Título", "Tipo", "Slug", "Estado", "Actualizado", "Publicado"]}>
          {items.map((c) => (
            <Row key={c.id}>
              <Cell>
                <Link href={`/admin/contenido/${c.id}`} className="font-medium no-underline">
                  {c.title}
                </Link>
              </Cell>
              <Cell>{c.type === "guide" ? "Guía" : "Blog"}</Cell>
              <Cell mono>{c.slug}</Cell>
              <Cell>
                <Badge tone={STATUS_TONE[c.status] ?? "muted"}>{c.status}</Badge>
              </Cell>
              <Cell mono>{fmt(c.updatedAt)}</Cell>
              <Cell mono>{c.publishedAt ? fmt(c.publishedAt) : "—"}</Cell>
            </Row>
          ))}
        </Table>
      )}

      <section aria-labelledby="cluster">
        <h2 id="cluster" className="mb-2 text-sm font-bold">
          Clúster SEO principal ({SEO_PAGES.length}) — editable en el código
        </h2>
        <Table head={["Slug", "Título", "Última revisión"]}>
          {SEO_PAGES.map((p) => (
            <Row key={p.slug}>
              <Cell mono>
                <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="no-underline">
                  /{p.slug}
                </a>
              </Cell>
              <Cell>{p.title}</Cell>
              <Cell mono>{p.lastReviewed}</Cell>
            </Row>
          ))}
        </Table>
      </section>
    </div>
  );
}
