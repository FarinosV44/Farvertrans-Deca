/**
 * Types + pure filter/sort for the `Oportunidades` radar (#87).
 *
 * No I/O, no `server-only`, no Prisma — `lib/commercial/opportunities.ts`
 * assembles the rows from the database and this module shapes them. Unit-tested
 * directly (`tests/unit/commercial-opportunities.test.ts`).
 */

import { z } from "zod";
import type { Zone } from "@/lib/commercial/corridors";

export type OpportunityState =
  | "review"
  | "contacted"
  | "interested"
  | "not_interested"
  | "unavailable"
  | "awaiting_load"
  | "first_load_offered"
  | "first_load_awarded"
  | "converted"
  | "discarded";

export const OPPORTUNITY_STATES: OpportunityState[] = [
  "review",
  "contacted",
  "interested",
  "not_interested",
  "unavailable",
  "awaiting_load",
  "first_load_offered",
  "first_load_awarded",
  "converted",
  "discarded",
];

export const OPPORTUNITY_STATE_LABEL: Record<OpportunityState, string> = {
  review: "Revisar",
  contacted: "Contactado",
  interested: "Interesado",
  not_interested: "No interesado",
  unavailable: "No disponible",
  awaiting_load: "Pendiente de carga adecuada",
  first_load_offered: "Primera carga ofrecida",
  first_load_awarded: "Primera carga adjudicada",
  converted: "Convertido en transportista Farvertrans",
  discarded: "Descartado",
};

/** The states that count an opportunity as commercially converted (#89 KPIs). */
export const CONVERTED_STATES: OpportunityState[] = ["converted"];
/** States still worth a further outreach step. */
export const OPEN_STATES: OpportunityState[] = [
  "review",
  "contacted",
  "interested",
  "awaiting_load",
  "first_load_offered",
];

/** The channel an operator used for a commercial action (#89). */
export const ACTIVITY_CHANNELS = ["whatsapp", "email", "call", "other", "none"] as const;
export type ActivityChannel = (typeof ACTIVITY_CHANNELS)[number];
export const ACTIVITY_CHANNEL_LABEL: Record<ActivityChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  call: "Llamada",
  other: "Otro",
  none: "Sin canal",
};

/**
 * Body of `PATCH /api/admin/oportunidades/[companyId]` (#87/#89). `state: null`
 * clears the follow-up row; at least one field must be present. `channel` and
 * the `outcome` block are #89 — recorded on the activity trail / the opportunity.
 */
export const opportunityUpdateSchema = z
  .object({
    state: z.enum(OPPORTUNITY_STATES as [OpportunityState, ...OpportunityState[]]).nullable(),
    note: z.string().trim().max(2000),
    channel: z.enum(ACTIVITY_CHANNELS),
    routeContext: z.string().trim().max(120),
    outcome: z.object({
      internalRef: z.string().trim().max(80).optional(),
      firstPorteDate: z.string().trim().max(10).optional(),
      loadsGenerated: z.number().int().min(0).max(1_000_000).optional(),
      revenueEur: z.number().int().min(0).max(1_000_000_000).optional(),
      marginEur: z.number().int().min(-1_000_000_000).max(1_000_000_000).optional(),
    }),
  })
  .partial()
  .refine(
    (d) =>
      d.state !== undefined ||
      d.note !== undefined ||
      d.channel !== undefined ||
      d.outcome !== undefined,
    { message: "Nada que actualizar." },
  );

/** A single route the carrier has been observed on (from `DecaRouteIntel`). */
export type RouteObservation = {
  routeKey: string | null;
  loadCity: string | null;
  loadProvince: string | null;
  loadCountry: string | null;
  unloadCity: string | null;
  unloadProvince: string | null;
  unloadCountry: string | null;
  /** ISO date (YYYY-MM-DD) or null. */
  loadDate: string | null;
  unloadDate: string | null;
  /** When the DeCA that produced this observation was generated. */
  observedAt: Date;
  carrierName: string | null;
  /** Corridor ids this route matches (`lib/commercial/corridors.ts`). */
  corridors: string[];
  endZone: Zone | null;
};

export type Opportunity = {
  companyId: string;
  companyName: string;
  companyStatus: string;
  companyContactName: string | null;

  /** The contact channel + values the company AUTHORISED (`CommercialConsent`). */
  channel: "email" | "phone" | "both" | null;
  contactEmail: string | null;
  contactPhone: string | null;
  consentMode: "per_deca" | "all";
  consentVersion: string;
  consentGrantedAt: Date | null;

  /** First-touch acquisition operator, resolved to a name where possible. */
  operator: { refCode: string; name: string } | null;
  lastOperatorRefCode: string | null;

  state: OpportunityState;
  note: string | null;
  contactedAt: Date | null;
  stateUpdatedAt: Date | null;

  /** #89 — the internal commercial operator who converted this, kept separate
   *  from the acquisition/referral operator above. */
  convertedByUserId: string | null;
  convertedAt: Date | null;
  /** #89 — optional manual economic outcome (whole euros). */
  outcome: {
    internalRef: string | null;
    firstPorteDate: Date | null;
    loadsGenerated: number | null;
    revenueEur: number | null;
    marginEur: number | null;
  };

  routes: RouteObservation[];

  // ---- derived (see deriveOpportunity) ----
  latestRoute: RouteObservation | null;
  lastActivityAt: Date | null;
  movements: { d7: number; d30: number; d60: number; d90: number; total: number };
  corridors: string[];
  corridorLabels: string[];
  endZones: Zone[];
  endZoneLabels: string[];
  /** Earliest future unload date across the observed routes. */
  nextUnloadDate: string | null;
  /** Highest repeat count of a single corridor over the last 90 days. */
  topRouteRepeat: number;
  topRouteLabel: string | null;
  /** Active company + a state where another outreach step still makes sense. */
  contactable: boolean;
};

export type OpportunitySort = "recent" | "recurrence" | "volume" | "upcoming";

export type OpportunityFilter = {
  originCountry?: string;
  originProvince?: string;
  originCity?: string;
  destCountry?: string;
  destProvince?: string;
  destCity?: string;
  /** ISO dates (YYYY-MM-DD) bounding a route's unload date. */
  unloadFrom?: string;
  unloadTo?: string;
  activity?: "7d" | "30d" | "90d";
  corridor?: string;
  /** Operator ref code (first-touch or last-touch). */
  operator?: string;
  /** Company name contains. */
  q?: string;
  /** Exact state, or "open" = review|contacted|interested. */
  state?: OpportunityState | "open";
  sort?: OpportunitySort;
};

function fold(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/** Case/accent-insensitive substring match; an empty query always matches. */
function textMatch(value: string | null | undefined, query: string | undefined): boolean {
  if (!query || !query.trim()) return true;
  return fold(value).includes(fold(query));
}

/** True when one observed route satisfies every active geo/date filter. */
export function routeMatchesGeoDate(route: RouteObservation, f: OpportunityFilter): boolean {
  if (!textMatch(route.loadCountry, f.originCountry)) return false;
  if (!textMatch(route.loadProvince, f.originProvince)) return false;
  if (!textMatch(route.loadCity, f.originCity)) return false;
  if (!textMatch(route.unloadCountry, f.destCountry)) return false;
  if (!textMatch(route.unloadProvince, f.destProvince)) return false;
  if (!textMatch(route.unloadCity, f.destCity)) return false;
  if (f.unloadFrom && (!route.unloadDate || route.unloadDate < f.unloadFrom)) return false;
  if (f.unloadTo && (!route.unloadDate || route.unloadDate > f.unloadTo)) return false;
  return true;
}

function hasGeoDateFilter(f: OpportunityFilter): boolean {
  return !!(
    f.originCountry ||
    f.originProvince ||
    f.originCity ||
    f.destCountry ||
    f.destProvince ||
    f.destCity ||
    f.unloadFrom ||
    f.unloadTo
  );
}

const ACTIVITY_DAYS: Record<NonNullable<OpportunityFilter["activity"]>, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** Apply every non-geo and geo filter (pure). */
export function applyOpportunityFilter(
  opps: Opportunity[],
  f: OpportunityFilter,
  now: Date = new Date(),
): Opportunity[] {
  const nowMs = now.getTime();
  const geoActive = hasGeoDateFilter(f);

  return opps.filter((o) => {
    if (!textMatch(o.companyName, f.q)) return false;

    if (f.operator) {
      const codes = [o.operator?.refCode, o.lastOperatorRefCode].filter(Boolean);
      if (!codes.includes(f.operator)) return false;
    }

    if (f.state) {
      if (f.state === "open") {
        if (!OPEN_STATES.includes(o.state)) return false;
      } else if (o.state !== f.state) return false;
    }

    if (f.corridor && !o.corridors.includes(f.corridor)) return false;

    if (f.activity) {
      const days = ACTIVITY_DAYS[f.activity];
      if (!o.lastActivityAt || nowMs - o.lastActivityAt.getTime() > days * 864e5) return false;
    }

    if (geoActive) {
      if (!o.routes.some((r) => routeMatchesGeoDate(r, f))) return false;
    }

    return true;
  });
}

const T = (d: Date | null) => (d ? d.getTime() : -Infinity);

/** Order the radar (pure). Default: most recent activity first. */
export function sortOpportunities(
  opps: Opportunity[],
  sort: OpportunitySort = "recent",
): Opportunity[] {
  const out = [...opps];
  switch (sort) {
    case "recurrence":
      out.sort(
        (a, b) => b.topRouteRepeat - a.topRouteRepeat || T(b.lastActivityAt) - T(a.lastActivityAt),
      );
      break;
    case "volume":
      out.sort(
        (a, b) => b.movements.d90 - a.movements.d90 || b.movements.total - a.movements.total,
      );
      break;
    case "upcoming":
      out.sort((a, b) => {
        const av = a.nextUnloadDate ?? "9999-99-99";
        const bv = b.nextUnloadDate ?? "9999-99-99";
        return av < bv ? -1 : av > bv ? 1 : T(b.lastActivityAt) - T(a.lastActivityAt);
      });
      break;
    case "recent":
    default:
      out.sort((a, b) => T(b.lastActivityAt) - T(a.lastActivityAt));
      break;
  }
  return out;
}
