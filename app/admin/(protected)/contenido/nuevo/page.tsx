import { PageHeader, BackLink } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { requireInternal } from "@/lib/admin/guard";
import { listContent } from "@/lib/content/cms";

export const dynamic = "force-dynamic";

export default async function NuevoContenido() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();

  // #97 — related-content picker candidates (nothing to exclude yet: this
  // item does not exist until the first save).
  const published = await listContent({ status: "published" });
  const candidates = published.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    type: p.type,
    category: p.category,
  }));

  return (
    <div className="space-y-5">
      <BackLink href="/admin/contenido">Contenido</BackLink>
      <PageHeader
        title="Nuevo contenido"
        lead="Se guarda como borrador. Publícalo cuando esté listo."
      />
      <ContentEditor candidates={candidates} />
    </div>
  );
}
