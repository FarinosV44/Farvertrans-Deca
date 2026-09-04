import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContentItem } from "@/prisma/generated/client";
import type { ContentInput, ContentType, ContentStatus } from "./schema";

/**
 * The admin-managed content engine's DB layer (SEO #32): guides at
 * `/guias/[slug]` and blog posts at `/blog/[slug]`, editable from
 * `/admin/contenido` with no deploy. The core SEO cluster
 * (`content/seo/pages.ts`) stays at root slugs — this is the additive layer.
 * The shape + validation live in `./schema` (client-safe).
 */

export type { ContentItem } from "@/prisma/generated/client";
export {
  contentInputSchema,
  contentWarnings,
  type ContentInput,
  type ContentType,
  type ContentStatus,
  type Source,
  type ContentWarning,
} from "./schema";

const clean = (v: string | undefined) => (v && v.length > 0 ? v : null);

function toData(input: ContentInput) {
  return {
    type: input.type,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category: clean(input.category),
    tags: input.tags,
    heroImage: clean(input.heroImage),
    authorName: clean(input.authorName),
    focusKeyword: clean(input.focusKeyword),
    seoTitle: clean(input.seoTitle),
    metaDescription: clean(input.metaDescription),
    canonicalOverride: clean(input.canonicalOverride),
    ogTitle: clean(input.ogTitle),
    ogDescription: clean(input.ogDescription),
    ogImage: clean(input.ogImage),
    robotsIndex: input.robotsIndex,
    sources: input.sources as unknown as object,
    relatedSlugs: input.relatedSlugs,
    ctaLabel: clean(input.ctaLabel),
    lastReviewedAt: input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
  };
}

export class SlugTakenError extends Error {
  constructor() {
    super("Ya existe contenido con ese slug.");
    this.name = "SlugTakenError";
  }
}

export async function createContent(input: ContentInput): Promise<ContentItem> {
  if (await prisma.contentItem.findUnique({ where: { slug: input.slug }, select: { id: true } }))
    throw new SlugTakenError();
  return prisma.contentItem.create({ data: toData(input) });
}

/** Update an item. A changed slug pushes the old one onto `previousSlugs` for a redirect. */
export async function updateContent(id: string, input: ContentInput): Promise<ContentItem> {
  const existing = await prisma.contentItem.findUnique({ where: { id } });
  if (!existing) throw new Error("not_found");
  if (input.slug !== existing.slug) {
    const clash = await prisma.contentItem.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (clash && clash.id !== id) throw new SlugTakenError();
  }
  const previousSlugs =
    input.slug !== existing.slug && existing.status === "published"
      ? [...new Set([...existing.previousSlugs, existing.slug])]
      : existing.previousSlugs;
  return prisma.contentItem.update({ data: { ...toData(input), previousSlugs }, where: { id } });
}

export async function setStatus(id: string, status: ContentStatus): Promise<ContentItem> {
  const existing = await prisma.contentItem.findUnique({ where: { id } });
  if (!existing) throw new Error("not_found");
  return prisma.contentItem.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
    },
  });
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  return prisma.contentItem.findUnique({ where: { id } });
}

/** Any-status lookup by slug — for the internal preview only. */
export async function getAnyStatusBySlug(
  type: ContentType,
  slug: string,
): Promise<ContentItem | null> {
  return prisma.contentItem.findFirst({ where: { type, slug } });
}

export async function listContent(filter: { type?: ContentType; status?: ContentStatus } = {}) {
  return prisma.contentItem.findMany({
    where: { type: filter.type, status: filter.status },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

/** A published item by public slug — or a redirect target if the slug moved. */
export async function resolvePublic(
  type: ContentType,
  slug: string,
): Promise<{ item: ContentItem } | { redirectTo: string } | null> {
  const item = await prisma.contentItem.findFirst({
    where: { type, slug, status: "published" },
  });
  if (item) return { item };
  const moved = await prisma.contentItem.findFirst({
    where: { type, status: "published", previousSlugs: { has: slug } },
    select: { slug: true },
  });
  if (moved) return { redirectTo: `/${type === "guide" ? "guias" : "blog"}/${moved.slug}` };
  return null;
}

/** Every published item, for the sitemap and static params. */
export async function listPublished(type?: ContentType) {
  return prisma.contentItem.findMany({
    where: { status: "published", type },
    select: { type: true, slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

/** Resolve related items (published only) for the "sigue leyendo" block. */
export async function resolveRelated(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await prisma.contentItem.findMany({
    where: { slug: { in: slugs }, status: "published" },
    select: { type: true, slug: true, title: true },
  });
  return rows.map((r) => ({
    title: r.title,
    href: `/${r.type === "guide" ? "guias" : "blog"}/${r.slug}`,
  }));
}
