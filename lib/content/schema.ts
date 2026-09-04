import { z } from "zod";

/**
 * CMS content shape + editorial validation (SEO #32). No `server-only` and no
 * Prisma import, so the admin editor (a client component) can use the schema
 * and the warnings directly. The DB layer lives in `cms.ts`.
 */

export type ContentType = "guide" | "blog";
export type ContentStatus = "draft" | "published" | "archived";
export type Source = { label: string; url: string };

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const contentInputSchema = z.object({
  type: z.enum(["guide", "blog"]),
  slug: z.string().trim().min(3).max(80).regex(slugRe, "Slug no válido (minúsculas, guiones)."),
  title: z.string().trim().min(5).max(160),
  excerpt: z.string().trim().min(10).max(320),
  body: z.string().trim().min(20),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  heroImage: z.string().trim().url().optional().or(z.literal("")),
  authorName: z.string().trim().max(80).optional().or(z.literal("")),
  focusKeyword: z.string().trim().max(80).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(180).optional().or(z.literal("")),
  canonicalOverride: z.string().trim().url().optional().or(z.literal("")),
  ogTitle: z.string().trim().max(90).optional().or(z.literal("")),
  ogDescription: z.string().trim().max(200).optional().or(z.literal("")),
  ogImage: z.string().trim().url().optional().or(z.literal("")),
  robotsIndex: z.boolean().default(true),
  sources: z
    .array(z.object({ label: z.string().trim().min(1), url: z.string().trim().url() }))
    .max(20)
    .default([]),
  relatedSlugs: z.array(z.string().trim().regex(slugRe)).max(12).default([]),
  ctaLabel: z.string().trim().max(60).optional().or(z.literal("")),
  lastReviewedAt: z.string().trim().optional().or(z.literal("")),
});

export type ContentInput = z.infer<typeof contentInputSchema>;

export type ContentWarning = { field: string; message: string };

/**
 * Editorial validation warnings — plain heuristics, NOT a fake SEO score (#32:
 * "Do not pretend to calculate a fake SEO score with false precision").
 */
export function contentWarnings(
  input: Pick<
    ContentInput,
    "title" | "seoTitle" | "metaDescription" | "body" | "sources" | "category" | "type"
  >,
): ContentWarning[] {
  const w: ContentWarning[] = [];
  const effTitle = input.seoTitle || input.title;
  if (!effTitle) w.push({ field: "title", message: "Falta el título." });
  if (effTitle && effTitle.length > 60)
    w.push({ field: "seoTitle", message: "El título SEO supera 60 caracteres." });
  if (!input.metaDescription)
    w.push({ field: "metaDescription", message: "Falta la meta descripción." });
  if (
    input.metaDescription &&
    (input.metaDescription.length < 70 || input.metaDescription.length > 160)
  )
    w.push({
      field: "metaDescription",
      message: "La meta descripción debería tener entre 70 y 160 caracteres.",
    });
  if (!/[a-zA-Z]/.test(input.body) || input.body.trim().length < 40)
    w.push({ field: "body", message: "El cuerpo parece vacío o demasiado corto." });
  if (!/\bCREAR DECA|\/crear\b/i.test(input.body) && !input.body.includes("[[cta]]"))
    w.push({ field: "body", message: "No hay un CTA al generador en el cuerpo (usa [[cta]])." });
  const legal = /oblig|normativ|resoluci|BOE|ley|sanci|inspecci/i.test(
    `${input.title} ${input.body} ${input.category ?? ""}`,
  );
  if (legal && input.sources.length === 0)
    w.push({
      field: "sources",
      message: "Contenido con afirmaciones normativas sin ninguna fuente citada.",
    });
  return w;
}
