import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleLayout } from "@/components/content/article-layout";
import {
  resolvePublic,
  resolveRelated,
  getContentById,
  getAnyStatusBySlug,
  type ContentType,
} from "@/lib/content/cms";
import { getInternalUser } from "@/lib/admin/guard";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

/**
 * Shared rendering for the CMS public routes (SEO #32). `/guias/[slug]` and
 * `/blog/[slug]` are thin wrappers over this. Draft/unpublished content 404s for
 * the public and is only viewable by an internal user via `?preview=1`.
 */

function familyPath(type: ContentType) {
  return type === "guide" ? "guias" : "blog";
}

export async function contentMetadata(type: ContentType, slug: string): Promise<Metadata> {
  const resolved = await resolvePublic(type, slug);
  if (!resolved || "redirectTo" in resolved) return {};
  const { item } = resolved;
  const url = item.canonicalOverride || `${publicEnv.baseUrl}/${familyPath(type)}/${item.slug}`;
  const title = item.seoTitle || item.title;
  const description = item.metaDescription || item.excerpt;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: item.robotsIndex ? undefined : { index: false, follow: false },
    openGraph: {
      type: type === "blog" ? "article" : "website",
      url,
      title: item.ogTitle || title,
      description: item.ogDescription || description,
      siteName: BRAND.name,
      images: item.ogImage || item.heroImage ? [item.ogImage || item.heroImage!] : undefined,
    },
  };
}

export async function ContentPage({
  type,
  slug,
  preview,
}: {
  type: ContentType;
  slug: string;
  preview?: string;
}) {
  // Internal preview of any status.
  if (preview) {
    const internal = await getInternalUser();
    if (internal) {
      const byId = /^[a-z0-9]{20,}$/i.test(slug) ? await getContentById(slug) : null;
      const item = byId ?? (await getAnyStatusBySlug(type, slug));
      if (item && item.type === type) {
        const related = await resolveRelated(item.relatedSlugs);
        return <ArticleLayout item={item} related={related} preview />;
      }
    }
  }

  const resolved = await resolvePublic(type, slug);
  if (!resolved) notFound();
  if ("redirectTo" in resolved) redirect(resolved.redirectTo);

  const { item } = resolved;
  const related = await resolveRelated(item.relatedSlugs);
  const url = `${publicEnv.baseUrl}/${familyPath(type)}/${item.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": type === "blog" ? "BlogPosting" : "Article",
      headline: item.title,
      description: item.excerpt,
      datePublished: item.publishedAt?.toISOString(),
      dateModified: item.updatedAt.toISOString(),
      author: { "@type": "Organization", name: item.authorName || BRAND.name },
      publisher: { "@type": "Organization", name: BRAND.name },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: publicEnv.baseUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: type === "guide" ? "Guías" : "Blog",
          item: `${publicEnv.baseUrl}/${familyPath(type)}`,
        },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with `<` escaped so a title can never break out
        // of the script tag (security.md T-5). Same JSON-LD pattern as the landing.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleLayout item={item} related={related} />
    </>
  );
}
