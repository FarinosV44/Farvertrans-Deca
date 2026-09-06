import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Company-scoped route intelligence (PRODUCT #56). Reads the `DecaRouteIntel`
 * rows already written by `lib/deca/route-intel.ts` on every DeCA creation
 * (DATA #45) — no new data collection, no GPS/realtime tracking invented.
 * Fetch-then-group in JS over a capped, most-recent-first window, the same
 * pattern already used in `lib/data/history.ts` for this company's data
 * volumes.
 */

export type RouteSummary = {
  key: string;
  loadCity: string;
  loadCountry: string | null;
  unloadCity: string;
  unloadCountry: string | null;
  count: number;
  lastUsedAt: Date;
  /** Most recent DeCA on this route — powers "quick create from route" via `/crear?from=`. */
  lastDecaId: string;
};

const ROUTE_INTEL_WINDOW = 1000;

/** Most frequent routes (corridor = load city/country → unload city/country), most-recent-first on ties. */
export async function getTopRoutes(companyId: string, limit = 5): Promise<RouteSummary[]> {
  const rows = await prisma.decaRouteIntel.findMany({
    where: { companyId, routeKey: { not: null } },
    orderBy: { generatedAt: "desc" },
    take: ROUTE_INTEL_WINDOW,
    select: {
      routeKey: true,
      loadCity: true,
      loadCountry: true,
      unloadCity: true,
      unloadCountry: true,
      generatedAt: true,
      decaId: true,
    },
  });

  const groups = new Map<string, RouteSummary>();
  for (const r of rows) {
    if (!r.routeKey) continue;
    const existing = groups.get(r.routeKey);
    if (existing) {
      existing.count += 1;
    } else {
      // Rows are most-recent-first, so the first time we see a key IS its
      // most recent occurrence — lastUsedAt/lastDecaId are correct as-is.
      groups.set(r.routeKey, {
        key: r.routeKey,
        loadCity: r.loadCity ?? "",
        loadCountry: r.loadCountry,
        unloadCity: r.unloadCity ?? "",
        unloadCountry: r.unloadCountry,
        count: 1,
        lastUsedAt: r.generatedAt,
        lastDecaId: r.decaId,
      });
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.count - a.count || b.lastUsedAt.getTime() - a.lastUsedAt.getTime())
    .slice(0, limit);
}
