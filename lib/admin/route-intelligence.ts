import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Cross-company route intelligence (DATA #45 §5, PRODUCT #56 "Routes/usage
 * intelligence"). Reads the same `DecaRouteIntel` rows the company-scoped
 * `lib/data/route-intel.ts` uses — no new data collection, no GPS/realtime
 * tracking. The one rule that makes this admin-only and different from the
 * per-company version: a company's rows are only included here when that
 * company has an explicit, granted `CommercialConsent` (DATA #45's own
 * privacy requirement — "must be used only under the applicable privacy/
 * legal basis and according to the separate commercial-consent model").
 * Nothing here is used for commercial matching yet; this is read-only
 * visibility for the platform team.
 */

export type CorridorSummary = {
  key: string;
  loadCity: string;
  loadCountry: string | null;
  unloadCity: string;
  unloadCountry: string | null;
  count: number;
  companyCount: number;
  lastUsedAt: Date;
};

const WINDOW = 5000;

export async function consentedCompanyCount(): Promise<{ consented: number; total: number }> {
  const [consented, total] = await Promise.all([
    prisma.commercialConsent.count({ where: { granted: true } }),
    prisma.company.count(),
  ]);
  return { consented, total };
}

/** Most frequent corridors platform-wide, counting only consented companies' rows. */
export async function topCorridors(since: Date, limit = 20): Promise<CorridorSummary[]> {
  const consentedIds = await prisma.commercialConsent.findMany({
    where: { granted: true },
    select: { companyId: true },
  });
  const companyIds = consentedIds.map((c) => c.companyId);
  if (companyIds.length === 0) return [];

  const rows = await prisma.decaRouteIntel.findMany({
    where: { companyId: { in: companyIds }, routeKey: { not: null }, generatedAt: { gte: since } },
    orderBy: { generatedAt: "desc" },
    take: WINDOW,
    select: {
      routeKey: true,
      loadCity: true,
      loadCountry: true,
      unloadCity: true,
      unloadCountry: true,
      generatedAt: true,
      companyId: true,
    },
  });

  const groups = new Map<string, CorridorSummary & { companies: Set<string> }>();
  for (const r of rows) {
    if (!r.routeKey) continue;
    const existing = groups.get(r.routeKey);
    if (existing) {
      existing.count += 1;
      if (r.companyId) existing.companies.add(r.companyId);
    } else {
      const companies = new Set<string>();
      if (r.companyId) companies.add(r.companyId);
      groups.set(r.routeKey, {
        key: r.routeKey,
        loadCity: r.loadCity ?? "",
        loadCountry: r.loadCountry,
        unloadCity: r.unloadCity ?? "",
        unloadCountry: r.unloadCountry,
        count: 1,
        companyCount: 0,
        lastUsedAt: r.generatedAt,
        companies,
      });
    }
  }

  return [...groups.values()]
    .map((g) => ({
      key: g.key,
      loadCity: g.loadCity,
      loadCountry: g.loadCountry,
      unloadCity: g.unloadCity,
      unloadCountry: g.unloadCountry,
      count: g.count,
      companyCount: g.companies.size,
      lastUsedAt: g.lastUsedAt,
    }))
    .sort((a, b) => b.count - a.count || b.lastUsedAt.getTime() - a.lastUsedAt.getTime())
    .slice(0, limit);
}
