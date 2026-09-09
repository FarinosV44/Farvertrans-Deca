/**
 * #97 — internal-linking architecture. Pure, DB-free logic only (Prisma-bound
 * helpers stay in `lib/content/cms.ts`), so this is directly Vitest-testable.
 *
 * The issue gives its hub and "strategic pages" lists as examples ("por
 * ejemplo") and explicitly asks for them to be fitted to the real URLs
 * ("La lista final debe ajustarse a las URLs reales y evitar duplicidades").
 * This module is that grounding: each of the issue's 8 example hubs is
 * mapped onto the closest existing `content/seo/pages.ts` pillar (one hub —
 * "Incidencias y práctica operativa" — has no dedicated pillar page yet, so
 * it deliberately has no `slug` and falls back to the closest existing hub,
 * `deca-pdf-qr`, until a dedicated pillar is published), and the example
 * strategic-page list is mapped onto real routes.
 */

export type Hub = { slug: string; label: string };

/** The issue's 8 example thematic hubs, grounded to real `content/seo/pages.ts` slugs. */
export const SEO_HUBS: Hub[] = [
  { slug: "que-es-el-deca", label: "Qué es el DeCA / normativa" },
  { slug: "como-hacer-un-deca", label: "Cómo hacer el DeCA" },
  { slug: "quien-esta-obligado-deca", label: "Obligaciones por tipo de empresa" },
  { slug: "deca-pdf-qr", label: "Inspecciones / QR / PDF / conservación" },
  { slug: "deca-agencias-transporte", label: "Agencias y subcontratación" },
  { slug: "deca-autonomos", label: "Transportistas y autónomos" },
  { slug: "deca-cargadores", label: "Cargadores" },
];

/** Fallback hub for content with no closer pillar yet (e.g. "incidencias" posts). */
export const DEFAULT_HUB_SLUG = "deca-pdf-qr";

/**
 * The issue's example "páginas estratégicas" list, grounded to real routes.
 * `/` (home) is included as a route, not a `content/seo/pages.ts` slug.
 */
export const STRATEGIC_ROUTES: string[] = [
  "/",
  "/deca-gratis",
  "/generador-deca",
  "/que-es-el-deca",
  "/como-hacer-un-deca",
  "/deca-obligatorio-2026",
  "/deca-agencias-transporte",
  "/deca-empresas-transporte",
  "/datos-obligatorios-deca",
];

/** Varied, natural anchor text per hub — never the same exact phrase reused sitewide. */
const HUB_ANCHORS: Record<string, string> = {
  "que-es-el-deca": "Qué es el DeCA y para qué sirve",
  "deca-obligatorio-2026": "Por qué el DeCA es obligatorio desde 2026",
  "como-hacer-un-deca": "Cómo hacer un DeCA paso a paso",
  "quien-esta-obligado-deca": "Quién está obligado a llevar el DeCA",
  "deca-pdf-qr": "Cómo funcionan el PDF, el QR y la conservación del DeCA",
  "deca-agencias-transporte": "DeCA para agencias de transporte",
  "deca-autonomos": "DeCA para transportistas autónomos",
  "deca-cargadores": "DeCA para cargadores",
};

/**
 * Up to `max` hub links relevant to `currentSlug`, excluding the page itself
 * and anything already linked elsewhere on the page. Deterministic (same
 * input → same output) so it never turns into an every-article-links-to-
 * every-page pattern (the issue's own anti-pattern rule) — it always offers
 * the SAME small, varied-anchor subset, just filtered down.
 */
export function pickCornerstones(
  currentSlug: string,
  alreadyLinkedSlugs: string[],
  max = 3,
): { slug: string; anchor: string }[] {
  const excluded = new Set([currentSlug, ...alreadyLinkedSlugs]);
  return SEO_HUBS.filter((h) => !excluded.has(h.slug))
    .slice(0, max)
    .map((h) => ({ slug: h.slug, anchor: HUB_ANCHORS[h.slug] ?? h.label }));
}

export type RelatedCandidate = {
  id: string;
  slug: string;
  title: string;
  type: string;
  category: string | null;
};

/**
 * "sugerir 3-5 contenidos relacionados por categoría/tema" (#97). Pure
 * filter over already-fetched candidates — same category as `current`
 * (case/whitespace-insensitive), excluding `current` itself and anything
 * uncategorised. Caller controls ordering (e.g. newest-first) by the order
 * of `candidates`; this only filters and caps.
 */
export function suggestRelatedByCategory(
  candidates: RelatedCandidate[],
  current: { id: string; category: string | null },
  limit = 5,
): RelatedCandidate[] {
  const cat = current.category?.trim().toLowerCase();
  if (!cat) return [];
  return candidates
    .filter((c) => c.id !== current.id && c.category?.trim().toLowerCase() === cat)
    .slice(0, limit);
}
