import { notFound } from "next/navigation";
import { getContentById, type Source } from "@/lib/content/cms";
import { PageHeader, BackLink, Badge } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function EditarContenido({ params }: { params: Promise<{ id: string }> }) {
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
