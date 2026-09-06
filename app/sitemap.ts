import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { SEO_PAGES } from "@/content/seo/pages";
import { listPublished } from "@/lib/content/cms";

export const dynamic = "force-dynamic";

/**
 * Genuine last-modified dates for the core static routes (not the SEO
 * cluster, which carries its own `lastReviewed` per page). These are the
 * real dates each route's content last changed, taken from git history —
 * NOT the deploy timestamp. Update the relevant entry only when that
 * route's actual content changes.
 */
const CORE_LAST_MODIFIED: Record<string, string> = {
  "/": "2026-09-06",
  "/soy-obligado": "2026-09-03",
  "/guias": "2026-09-04",
  "/blog": "2026-09-06",
  "/revision-legal": "2026-09-06",
};

/**
 * Public, indexable pages only — never /admin, /panel, /api, /d/ or PDFs.
 * Published CMS content only.
 *
 * `/crear` is intentionally excluded: it is an application/form screen
 * (`noindex, follow`), not a canonical landing page — `/generador-deca`
 * is the indexable transactional equivalent and stays listed via
 * `SEO_PAGES`.
 *
 * `priority`/`changeFrequency` are not emitted: Google has long stated it
 * ignores both as ranking/crawl signals, so they are noise rather than an
 * SEO lever.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = Object.keys(CORE_LAST_MODIFIED);
  const staticEntries = core.map((path) => ({
    url: `${publicEnv.baseUrl}${path}`,
    lastModified: CORE_LAST_MODIFIED[path],
  }));

  const seoEntries = SEO_PAGES.map((p) => ({
    url: `${publicEnv.baseUrl}/${p.slug}`,
    lastModified: p.lastReviewed,
  }));

  let content: MetadataRoute.Sitemap = [];
  try {
    const published = await listPublished();
    content = published.map((c) => ({
      url: `${publicEnv.baseUrl}/${c.type === "guide" ? "guias" : "blog"}/${c.slug}`,
      lastModified: c.updatedAt,
    }));
  } catch {
    // DB unavailable at build/prerender — the static entries still ship.
  }

  return [...staticEntries, ...seoEntries, ...content];
}
