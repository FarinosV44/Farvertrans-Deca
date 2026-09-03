import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/** Public, indexable pages only — never /app, /api, /d/ or generated PDFs. */
const PUBLIC_PATHS = ["/", "/crear"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((p) => ({
    url: `${publicEnv.baseUrl}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
}
