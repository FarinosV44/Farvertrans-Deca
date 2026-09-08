import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/admin/audit";
import {
  CORRIDORS,
  matchCorridors,
  endZone,
  ZONE_LABEL,
  type Zone,
  type RouteFacts,
} from "@/lib/commercial/corridors";
import {
  applyOpportunityFilter,
  sortOpportunities,
  type Opportunity,
  type OpportunityFilter,
  type RouteObservation,
} from "@/lib/commercial/opportunity-model";

/**
 * `Super Admin > Oportunidades` (#87). A radar of carrier companies that have an
 * ACTIVE `CommercialConsent` (`mode != 'none'`), each with the route activity
 * observed from their own DeCA (`DecaRouteIntel` — the same rows the internal
 * route views already read, no new data collection), the contact channel and
 * values they authorised, their acquisition operator, and the internal team's
 * manual follow-up state (`CommercialOpportunity`).
 *
 * Everything is a query over rows the product already stores. No geocoding, no
 * external enrichment, no paid AI, no automatic messaging.
 */

export {
  applyOpportunityFilter,
  sortOpportunities,
  type Opportunity,
  type OpportunityFilter,
  type RouteObservation,
};

/** Newest-first window of route-intel rows we consider (perf cap, like route-intelligence.ts). */
const ROUTE_WINDOW = 4000;
/** How far back a route still counts as observed activity for the radar. */
const ACTIVITY_LOOKBACK_DAYS = 180;

/** States from which a further outreach action still makes sense. */
const CONTACTABLE_STATES = new Set<Opportunity["state"]>(["review", "contacted", "interested"]);

export type OpportunityListResult = {
  opportunities: Opportunity[];
  eligibleCount: number;
  operators: { refCode: string; name: string }[];
};

function corridorLabel(id: string): string {
  return CORRIDORS.find((c) => c.id === id)?.label ?? id;
}

function toRouteObservation(r: {
  routeKey: string | null;
  loadCity: string | null;
  loadProvince: string | null;
  loadCountry: string | null;
  unloadCity: string | null;
  unloadProvince: string | null;
  unloadCountry: string | null;
  loadDate: Date | null;
  unloadDate: Date | null;
  generatedAt: Date;
  carrierName: string | null;
}): RouteObservation {
  const facts: RouteFacts = {
    loadCountry: r.loadCountry,
    loadProvince: r.loadProvince,
    loadCity: r.loadCity,
    unloadCountry: r.unloadCountry,
    unloadProvince: r.unloadProvince,
    unloadCity: r.unloadCity,
  };
  return {
    routeKey: r.routeKey,
    loadCity: r.loadCity,
    loadProvince: r.loadProvince,
    loadCountry: r.loadCountry,
    unloadCity: r.unloadCity,
    unloadProvince: r.unloadProvince,
    unloadCountry: r.unloadCountry,
    loadDate: r.loadDate ? r.loadDate.toISOString().slice(0, 10) : null,
    unloadDate: r.unloadDate ? r.unloadDate.toISOString().slice(0, 10) : null,
    observedAt: r.generatedAt,
    carrierName: r.carrierName,
    corridors: matchCorridors(facts).map((c) => c.id),
    endZone: endZone(facts),
  };
}

type DeriveInput = Omit<
  Opportunity,
  | "lastActivityAt"
  | "movements"
  | "latestRoute"
  | "corridors"
  | "corridorLabels"
  | "endZones"
  | "endZoneLabels"
  | "nextUnloadDate"
  | "topRouteRepeat"
  | "topRouteLabel"
  | "contactable"
>;

/** Fold a company + its route observations into a radar row (pure). */
export function deriveOpportunity(input: DeriveInput, now: Date = new Date()): Opportunity {
  const routes = [...input.routes].sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
  const nowMs = now.getTime();
  const within = (days: number) =>
    routes.filter((r) => nowMs - r.observedAt.getTime() <= days * 864e5).length;

  const corridorSet = new Set<string>();
  for (const r of routes) for (const c of r.corridors) corridorSet.add(c);
  const endZoneSet = new Set<Zone>();
  for (const r of routes) if (r.endZone) endZoneSet.add(r.endZone);

  // recurrence: the most-repeated routeKey in the last 90 days
  const repeatCounts = new Map<string, { count: number; label: string }>();
  for (const r of routes) {
    if (!r.routeKey || nowMs - r.observedAt.getTime() > 90 * 864e5) continue;
    const label = `${r.loadCity ?? "—"} → ${r.unloadCity ?? "—"}`;
    const e = repeatCounts.get(r.routeKey) ?? { count: 0, label };
    e.count += 1;
    repeatCounts.set(r.routeKey, e);
  }
  let topRouteRepeat = 0;
  let topRouteLabel: string | null = null;
  for (const e of repeatCounts.values()) {
    if (e.count > topRouteRepeat) {
      topRouteRepeat = e.count;
      topRouteLabel = e.label;
    }
  }

  const todayIso = now.toISOString().slice(0, 10);
  const upcoming = routes
    .map((r) => r.unloadDate)
    .filter((d): d is string => !!d && d >= todayIso)
    .sort();

  const corridors = [...corridorSet];
  const endZones = [...endZoneSet];

  return {
    ...input,
    latestRoute: routes[0] ?? null,
    lastActivityAt: routes[0]?.observedAt ?? null,
    movements: {
      d7: within(7),
      d30: within(30),
      d60: within(60),
      d90: within(90),
      total: routes.length,
    },
    corridors,
    corridorLabels: corridors.map(corridorLabel),
    endZones,
    endZoneLabels: endZones.map((z) => ZONE_LABEL[z]),
    nextUnloadDate: upcoming[0] ?? null,
    topRouteRepeat,
    topRouteLabel,
    contactable: input.companyStatus === "active" && CONTACTABLE_STATES.has(input.state),
  };
}

/** Build the full radar, then apply the filter/sort (pure) on top. */
export async function listOpportunities(
  filter: OpportunityFilter = {},
  now: Date = new Date(),
): Promise<OpportunityListResult> {
  const consents = await prisma.commercialConsent.findMany({
    where: { mode: { not: "none" } },
    select: {
      companyId: true,
      mode: true,
      channel: true,
      contactEmail: true,
      contactPhone: true,
      version: true,
      grantedAt: true,
    },
  });
  const eligibleCount = consents.length;
  if (eligibleCount === 0) return { opportunities: [], eligibleCount: 0, operators: [] };

  const companyIds = consents.map((c) => c.companyId);
  const lookbackSince = new Date(now.getTime() - ACTIVITY_LOOKBACK_DAYS * 864e5);

  const [companies, routeRows, acquisitions, opportunityRows, operatorRows] = await Promise.all([
    prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, status: true, contactName: true },
    }),
    prisma.decaRouteIntel.findMany({
      where: { companyId: { in: companyIds }, generatedAt: { gte: lookbackSince } },
      orderBy: { generatedAt: "desc" },
      take: ROUTE_WINDOW,
      select: {
        companyId: true,
        routeKey: true,
        loadCity: true,
        loadProvince: true,
        loadCountry: true,
        unloadCity: true,
        unloadProvince: true,
        unloadCountry: true,
        loadDate: true,
        unloadDate: true,
        generatedAt: true,
        carrierName: true,
      },
    }),
    prisma.acquisition.findMany({
      where: { companyId: { in: companyIds } },
      select: { companyId: true, firstRefCode: true, lastRefCode: true },
    }),
    prisma.commercialOpportunity.findMany({
      where: { companyId: { in: companyIds } },
      select: { companyId: true, state: true, note: true, contactedAt: true, updatedAt: true },
    }),
    prisma.operator.findMany({ select: { refCode: true, name: true, lastName: true } }),
  ]);

  const companyById = new Map(companies.map((c) => [c.id, c]));
  const consentByCompany = new Map(consents.map((c) => [c.companyId, c]));
  const acqByCompany = new Map(acquisitions.map((a) => [a.companyId!, a]));
  const oppByCompany = new Map(opportunityRows.map((o) => [o.companyId, o]));
  const operatorByCode = new Map(
    operatorRows.map((o) => [
      o.refCode,
      { refCode: o.refCode, name: [o.name, o.lastName].filter(Boolean).join(" ") },
    ]),
  );

  const routesByCompany = new Map<string, RouteObservation[]>();
  for (const r of routeRows) {
    if (!r.companyId) continue;
    const list = routesByCompany.get(r.companyId) ?? [];
    list.push(toRouteObservation(r));
    routesByCompany.set(r.companyId, list);
  }

  const opportunities: Opportunity[] = [];
  for (const companyId of companyIds) {
    const company = companyById.get(companyId);
    if (!company) continue;
    const consent = consentByCompany.get(companyId)!;
    const acq = acqByCompany.get(companyId);
    const opp = oppByCompany.get(companyId);
    const routes = routesByCompany.get(companyId) ?? [];

    const firstOperator = acq?.firstRefCode
      ? (operatorByCode.get(acq.firstRefCode) ?? {
          refCode: acq.firstRefCode,
          name: acq.firstRefCode,
        })
      : null;

    opportunities.push(
      deriveOpportunity(
        {
          companyId,
          companyName: company.name,
          companyStatus: company.status,
          companyContactName: company.contactName,
          channel: consent.channel,
          contactEmail: consent.contactEmail,
          contactPhone: consent.contactPhone,
          consentMode: consent.mode as "per_deca" | "all",
          consentVersion: consent.version,
          consentGrantedAt: consent.grantedAt,
          operator: firstOperator,
          lastOperatorRefCode: acq?.lastRefCode ?? null,
          state: opp?.state ?? "review",
          note: opp?.note ?? null,
          contactedAt: opp?.contactedAt ?? null,
          stateUpdatedAt: opp?.updatedAt ?? null,
          routes,
        },
        now,
      ),
    );
  }

  const operators = [...operatorByCode.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const filtered = sortOpportunities(
    applyOpportunityFilter(opportunities, filter, now),
    filter.sort,
  );
  return { opportunities: filtered, eligibleCount, operators };
}

/**
 * Set (or clear) the internal follow-up state for a carrier (#87). `state: null`
 * removes the row entirely (back to "not reviewed"). Refuses a company that is
 * not eligible. Audited (`SecurityAuditLog`); never touches `CommercialConsent`.
 */
export async function setOpportunityState(
  companyId: string,
  input: { state?: Opportunity["state"] | null; note?: string | null },
  actorUserId: string,
): Promise<void> {
  const consent = await prisma.commercialConsent.findUnique({
    where: { companyId },
    select: { mode: true },
  });
  if (!consent || consent.mode === "none") throw new Error("not_eligible");

  if (input.state === null) {
    await prisma.commercialOpportunity.deleteMany({ where: { companyId } });
  } else {
    const base = {
      updatedByUserId: actorUserId,
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
      ...(input.state === "contacted" ? { contactedAt: new Date() } : {}),
    };
    await prisma.commercialOpportunity.upsert({
      where: { companyId },
      create: {
        companyId,
        state: input.state ?? "review",
        note: input.note ?? null,
        updatedByUserId: actorUserId,
        ...(input.state === "contacted" ? { contactedAt: new Date() } : {}),
      },
      update: base,
    });
  }

  await recordAudit({
    actorId: actorUserId,
    action: `commercial_opportunity:${input.state ?? "cleared"}`,
    targetType: "company",
    targetId: companyId,
    result: "success",
  });
}
