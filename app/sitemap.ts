import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { SEO_PAGES } from "@/content/seo/pages";

/** Public, indexable pages only — never /app, /api, /d/ or generated PDFs. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core = ["/", "/crear", "/soy-obligado"];
  const seo = SEO_PAGES.map((p) => `/${p.slug}`);

  return [...core, ...seo].map((path) => ({
    url: `${publicEnv.baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : path === "/crear" || path === "/generador-deca" ? 0.9 : 0.7,
  }));
}
