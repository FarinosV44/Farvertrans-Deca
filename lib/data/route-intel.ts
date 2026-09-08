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
  /** Company-scoped favourite (#78) — favourites float to the top. */
  favorite: boolean;
};

const ROUTE_INTEL_WINDOW = 1000;

/**
 * Most frequent routes (corridor = load city/country → unload city/country),
 * most-recent-first on ties. Favourites (#78) always come first, whatever their
 * frequency, and a favourited corridor with no DeCA yet still appears.
 */
export async function getTopRoutes(companyId: string, limit = 5): Promise<RouteSummary[]> {
  const favRows = await prisma.favoriteRoute.findMany({ where: { companyId } });
  const favByKey = new Map(favRows.map((f) => [f.routeKey, f]));

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
        favorite: favByKey.has(r.routeKey),
      });
    }
  }

  // A favourited corridor with no DeCA on it yet still shows.
  for (const [key, f] of favByKey) {
    if (groups.has(key)) continue;
    groups.set(key, {
      key,
      loadCity: f.loadCity,
      loadCountry: f.loadCountry,
      unloadCity: f.unloadCity,
      unloadCountry: f.unloadCountry,
      count: 0,
      lastUsedAt: f.createdAt,
      lastDecaId: "",
      favorite: true,
    });
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        Number(b.favorite) - Number(a.favorite) ||
        b.count - a.count ||
        b.lastUsedAt.getTime() - a.lastUsedAt.getTime(),
    )
    .slice(0, limit);
}

/** Toggle a company's favourite for a route corridor (#78). */
export async function setRouteFavorite(
  companyId: string,
  route: {
    routeKey: string;
    loadCity: string;
    loadCountry: string | null;
    unloadCity: string;
    unloadCountry: string | null;
  },
  favorite: boolean,
): Promise<void> {
  if (favorite) {
    await prisma.favoriteRoute.upsert({
      where: { companyId_routeKey: { companyId, routeKey: route.routeKey } },
      create: {
        companyId,
        routeKey: route.routeKey,
        loadCity: route.loadCity,
        loadCountry: route.loadCountry ?? "",
        unloadCity: route.unloadCity,
        unloadCountry: route.unloadCountry ?? "",
      },
      update: {},
    });
  } else {
    await prisma.favoriteRoute.deleteMany({ where: { companyId, routeKey: route.routeKey } });
  }
}
