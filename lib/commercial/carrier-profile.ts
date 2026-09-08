import "server-only";
import { prisma } from "@/lib/prisma";
import { summariseActivity, type ActivitySummary } from "@/lib/commercial/activity";
import { affinityScore, autoTags, type AffinityResult } from "@/lib/commercial/affinity";
import { matchCorridors, endZone, ZONE_LABEL, type RouteFacts } from "@/lib/commercial/corridors";

/**
 * Carrier commercial profile for `/admin/empresas/[id]` (#88): the "Actividad de
 * transporte / Perfil comercial" tab. Activity recurrence, top routes and
 * frequent zones from the carrier's own DeCA (`Deca` + `DecaRouteIntel` — the
 * rows the internal route views already read), recurring plates, and a
 * transparent rule-based "Afinidad Farvertrans" score with its full breakdown.
 *
 * Shown ONLY when the company has an active `CommercialConsent` — otherwise the
 * page renders a one-line note and none of this is computed (#88 privacy AC).
 */

export type FreqRow = { name: string; count: number };
export type PlateRow = { plate: string; count: number };
export type RouteRow = {
  routeKey: string;
  label: string;
  count: number;
  lastSeen: Date;
  corridorLabels: string[];
  endZoneLabel: string | null;
  /** Approx repeats per 30 days over the span first→last seen. */
  perMonth: number;
};

export type CarrierRouteRecord = {
  routeKey: string | null;
  loadCity: string | null;
  loadProvince: string | null;
  loadCountry: string | null;
  unloadCity: string | null;
  unloadProvince: string | null;
  unloadCountry: string | null;
  tractorPlate: string | null;
  generatedAt: Date;
};

export type CarrierRouteSummary = {
  routes: RouteRow[];
  loadCountries: FreqRow[];
  unloadCountries: FreqRow[];
  loadProvinces: FreqRow[];
  unloadProvinces: FreqRow[];
  loadCities: FreqRow[];
  unloadCities: FreqRow[];
  plates: PlateRow[];
  corridorIds: string[];
  topRouteRepeat: number;
};

export type CarrierProfile =
  | { eligible: false }
  | {
      eligible: true;
      activity: ActivitySummary;
      routeSummary: CarrierRouteSummary;
      affinity: AffinityResult;
      tags: string[];
      consentMode: "per_deca" | "all";
    };

const DAY_MS = 864e5;

function tally(values: (string | null | undefined)[], limit = 6): FreqRow[] {
  const m = new Map<string, number>();
  for (const v of values) {
    const name = (v ?? "").trim();
    if (!name) continue;
    m.set(name, (m.get(name) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
    .slice(0, limit);
}

/** Pure: fold the carrier's route records into the profile's route section. */
export function summariseRoutes(records: CarrierRouteRecord[]): CarrierRouteSummary {
  const groups = new Map<
    string,
    { count: number; lastSeen: Date; firstSeen: Date; label: string; facts: RouteFacts }
  >();
  const corridorSet = new Set<string>();

  for (const r of records) {
    const facts: RouteFacts = {
      loadCountry: r.loadCountry,
      loadProvince: r.loadProvince,
      loadCity: r.loadCity,
      unloadCountry: r.unloadCountry,
      unloadProvince: r.unloadProvince,
      unloadCity: r.unloadCity,
    };
    for (const c of matchCorridors(facts)) corridorSet.add(c.id);

    const key = r.routeKey ?? `${r.loadCity ?? "?"}__${r.unloadCity ?? "?"}`;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      if (r.generatedAt > g.lastSeen) g.lastSeen = r.generatedAt;
      if (r.generatedAt < g.firstSeen) g.firstSeen = r.generatedAt;
    } else {
      groups.set(key, {
        count: 1,
        lastSeen: r.generatedAt,
        firstSeen: r.generatedAt,
        label: `${r.loadCity ?? "—"} → ${r.unloadCity ?? "—"}`,
        facts,
      });
    }
  }

  const routes: RouteRow[] = [...groups.entries()]
    .map(([routeKey, g]) => {
      const spanDays = Math.max(1, (g.lastSeen.getTime() - g.firstSeen.getTime()) / DAY_MS);
      const perMonth = g.count > 1 ? (g.count / spanDays) * 30 : 0;
      const ez = endZone(g.facts);
      return {
        routeKey,
        label: g.label,
        count: g.count,
        lastSeen: g.lastSeen,
        corridorLabels: matchCorridors(g.facts).map((c) => c.label),
        endZoneLabel: ez ? ZONE_LABEL[ez] : null,
        perMonth: Math.round(perMonth * 10) / 10,
      };
    })
    .sort((a, b) => b.count - a.count || b.lastSeen.getTime() - a.lastSeen.getTime())
    .slice(0, 8);

  return {
    routes,
    loadCountries: tally(records.map((r) => r.loadCountry)),
    unloadCountries: tally(records.map((r) => r.unloadCountry)),
    loadProvinces: tally(records.map((r) => r.loadProvince)),
    unloadProvinces: tally(records.map((r) => r.unloadProvince)),
    loadCities: tally(records.map((r) => r.loadCity)),
    unloadCities: tally(records.map((r) => r.unloadCity)),
    plates: tally(records.map((r) => r.tractorPlate))
      .filter((p) => p.count >= 2)
      .map((p) => ({ plate: p.name, count: p.count })),
    corridorIds: [...corridorSet],
    topRouteRepeat: routes.reduce((n, r) => Math.max(n, r.count), 0),
  };
}

export async function buildCarrierProfile(
  companyId: string,
  now: Date = new Date(),
): Promise<CarrierProfile> {
  const consent = await prisma.commercialConsent.findUnique({
    where: { companyId },
    select: { mode: true, channel: true, contactEmail: true, contactPhone: true },
  });
  if (!consent || consent.mode === "none") return { eligible: false };
  const consentMode = consent.mode as "per_deca" | "all";

  const [decas, routeRows] = await Promise.all([
    prisma.deca.findMany({ where: { companyId }, select: { createdAt: true } }),
    prisma.decaRouteIntel.findMany({
      where: { companyId },
      orderBy: { generatedAt: "desc" },
      take: 2000,
      select: {
        routeKey: true,
        loadCity: true,
        loadProvince: true,
        loadCountry: true,
        unloadCity: true,
        unloadProvince: true,
        unloadCountry: true,
        tractorPlate: true,
        generatedAt: true,
      },
    }),
  ]);

  const activity = summariseActivity(
    decas.map((d) => d.createdAt),
    now,
  );
  const routeSummary = summariseRoutes(routeRows);

  const hasAuthorisedContact =
    (consent.channel === "phone" || consent.channel === "both") && !!consent.contactPhone
      ? true
      : (consent.channel === "email" || consent.channel === "both") && !!consent.contactEmail;

  const affinityInput = {
    d7: activity.d7,
    d30: activity.d30,
    d90: activity.d90,
    total: activity.total,
    trend: activity.trend,
    daysSinceFirst: activity.firstAt
      ? Math.floor((now.getTime() - activity.firstAt.getTime()) / DAY_MS)
      : null,
    topRouteRepeat: routeSummary.topRouteRepeat,
    distinctRoutes: routeSummary.routes.length,
    corridorIds: routeSummary.corridorIds,
    hasAuthorisedContact,
    consentMode,
  };

  return {
    eligible: true,
    activity,
    routeSummary,
    affinity: affinityScore(affinityInput),
    tags: autoTags(affinityInput),
    consentMode,
  };
}
