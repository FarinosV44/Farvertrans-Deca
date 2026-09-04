import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { SEO_PAGES } from "@/content/seo/pages";
import { listPublished } from "@/lib/content/cms";

export const dynamic = "force-dynamic";

/** Public, indexable pages only — never /admin, /panel, /api, /d/ or PDFs. Published CMS content only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const core = ["/", "/crear", "/soy-obligado", "/guias", "/blog"];
  const seo = SEO_PAGES.map((p) => `/${p.slug}`);
  const staticEntries = [...core, ...seo].map((path) => ({
    url: `${publicEnv.baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : path === "/crear" || path === "/generador-deca" ? 0.9 : 0.7,
  }));

  let content: MetadataRoute.Sitemap = [];
  try {
    const published = await listPublished();
    content = published.map((c) => ({
      url: `${publicEnv.baseUrl}/${c.type === "guide" ? "guias" : "blog"}/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build/prerender — the static entries still ship.
  }

  return [...staticEntries, ...content];
}
