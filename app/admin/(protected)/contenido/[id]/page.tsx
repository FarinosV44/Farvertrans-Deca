import { notFound } from "next/navigation";
import { getContentById, type Source } from "@/lib/content/cms";
import { PageHeader, BackLink, Badge } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function EditarContenido({ params }: { params: Promise<{ id: string }> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const { id } = await params;
  const c = await getContentById(id);
  if (!c) notFound();

  const sources = (c.sources as unknown as Source[]) ?? [];

  return (
    <div className="space-y-5">
      <BackLink href="/admin/contenido">Contenido</BackLink>
      <PageHeader
        title={c.title}
        lead={`/${c.type === "guide" ? "guias" : "blog"}/${c.slug}`}
        action={<Badge tone={c.status === "published" ? "green" : "yellow"}>{c.status}</Badge>}
      />
      <ContentEditor
        id={c.id}
        status={c.status}
        initial={{
          type: c.type,
          slug: c.slug,
          title: c.title,
          excerpt: c.excerpt,
          body: c.body,
          category: c.category ?? "",
          tagsText: c.tags.join(", "),
          heroImage: c.heroImage ?? "",
          authorName: c.authorName ?? "",
          focusKeyword: c.focusKeyword ?? "",
          seoTitle: c.seoTitle ?? "",
          metaDescription: c.metaDescription ?? "",
          canonicalOverride: c.canonicalOverride ?? "",
          ogTitle: c.ogTitle ?? "",
          ogDescription: c.ogDescription ?? "",
          ogImage: c.ogImage ?? "",
          robotsIndex: c.robotsIndex,
          sourcesText: sources.map((s) => `${s.label} | ${s.url}`).join("\n"),
          relatedSlugs: c.relatedSlugs,
          ctaLabel: c.ctaLabel ?? "",
          lastReviewedAt: c.lastReviewedAt ? c.lastReviewedAt.toISOString().slice(0, 10) : "",
        }}
      />
    </div>
  );
}
