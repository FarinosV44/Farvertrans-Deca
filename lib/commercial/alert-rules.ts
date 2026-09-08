/**
 * Pure rule engine for the internal commercial alerts (#90). No I/O, no
 * `server-only` — `lib/commercial/alerts.ts` feeds it and stores the results.
 * Every rule is a plain, documented condition over data the product already
 * has. Unit-tested directly.
 */

import type { OpportunityState } from "@/lib/commercial/opportunity-model";
import type { Zone } from "@/lib/commercial/corridors";

export type AlertConfig = {
  priorityCorridors: string[];
  priorityCountries: string[];
  minMovements: number;
  windowDays: number;
  staleFollowUpDays: number;
  reactivationDays: number;
};

export type AlertInput = {
  companyId: string;
  companyName: string;
  state: OpportunityState;
  corridors: string[];
  endZoneLabels: string[];
  endZones: Zone[];
  movements: { d7: number; d30: number; d60: number; d90: number; total: number };
  topRouteRepeat: number;
  topRouteLabel: string | null;
  nextUnloadDate: string | null;
  lastActivityAt: Date | null;
  /** Days between the two most recent route observations. */
  routeGapDays: number | null;
  /** Last time an operator logged a commercial action for this company. */
  lastCommercialTouchAt: Date | null;
  hasAcquisitionOperator: boolean;
  signupAt: Date | null;
  firstDecaAt: Date | null;
};

export type AlertCandidate = {
  kind: string;
  dedupeKey: string;
  title: string;
  detail: string;
  score: number;
  routeContext: string | null;
};

export const ALERT_RULES: { kind: string; label: string }[] = [
  { kind: "upcoming_priority_zone", label: "Descarga próxima en zona prioritaria" },
  { kind: "first_time_priority_corridor", label: "Primera actividad en corredor de interés" },
  { kind: "multiple_recent_same_zone", label: "Varias descargas recientes en la misma zona" },
  { kind: "route_repeated_3x_30d", label: "Ruta repetida 3+ veces" },
  { kind: "growing_activity", label: "Actividad creciente frente al periodo anterior" },
  { kind: "interesting_uncontacted", label: "Transportista interesante sin contactar" },
  { kind: "interested_no_followup", label: "Interesado sin seguimiento" },
  { kind: "reactivated", label: "Empresa activa de nuevo tras una pausa larga" },
  { kind: "referral_first_deca", label: "Registro por operador que ya generó su primer DeCA" },
  { kind: "acquired_company_recurring", label: "Empresa captada con actividad recurrente" },
];

const DAY_MS = 864e5;

function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / DAY_MS);
}

/** ISO week bucket, so a time-sensitive alert refreshes weekly rather than daily. */
function weekBucket(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / DAY_MS -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}W${String(week).padStart(2, "0")}`;
}

const OPEN_FOR_FOLLOWUP: OpportunityState[] = [
  "contacted",
  "interested",
  "awaiting_load",
  "first_load_offered",
];

/** Every alert a company currently qualifies for (usually zero to three). */
export function evaluateAlerts(
  i: AlertInput,
  config: AlertConfig,
  now: Date = new Date(),
): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const wk = weekBucket(now);
  const key = (kind: string, bucket = "") => `${i.companyId}:${kind}${bucket ? `:${bucket}` : ""}`;
  const priorityCorridorHit = i.corridors.filter((c) => config.priorityCorridors.includes(c));
  const priorityZoneHit =
    config.priorityCountries.length > 0 &&
    i.endZoneLabels.some((z) =>
      config.priorityCountries.some((p) => z.toLowerCase().includes(p.toLowerCase())),
    );
  const priorityRoute = priorityCorridorHit.length > 0 || priorityZoneHit;

  // --- capacity / recent activity ---
  if (i.nextUnloadDate) {
    const days = daysBetween(new Date(`${i.nextUnloadDate}T00:00:00Z`), now);
    if (days <= 7 && priorityRoute) {
      out.push({
        kind: "upcoming_priority_zone",
        dedupeKey: key("upcoming_priority_zone", i.nextUnloadDate),
        title: `Descarga el ${i.nextUnloadDate} en zona prioritaria`,
        detail: `${i.companyName} tiene una descarga prevista el ${i.nextUnloadDate}${
          i.endZoneLabels[0] ? ` (${i.endZoneLabels.join(", ")})` : ""
        }.`,
        score: 90,
        routeContext: i.topRouteLabel,
      });
    }
  }

  if (priorityCorridorHit.length > 0 && i.movements.total <= 3) {
    out.push({
      kind: "first_time_priority_corridor",
      dedupeKey: key("first_time_priority_corridor"),
      title: "Primera actividad en un corredor de interés",
      detail: `${i.companyName} aparece por primera vez en un corredor prioritario (${priorityCorridorHit.join(", ")}).`,
      score: 70,
      routeContext: i.topRouteLabel,
    });
  }

  if (i.movements.d7 >= config.minMovements && i.endZones.length === 1) {
    out.push({
      kind: "multiple_recent_same_zone",
      dedupeKey: key("multiple_recent_same_zone", wk),
      title: "Varias descargas recientes en la misma zona",
      detail: `${i.movements.d7} DeCA en 7 días, todas hacia ${i.endZoneLabels[0] ?? "la misma zona"}.`,
      score: 60,
      routeContext: i.topRouteLabel,
    });
  }

  // --- recurrence ---
  if (i.topRouteRepeat >= 3) {
    out.push({
      kind: "route_repeated_3x_30d",
      dedupeKey: key("route_repeated_3x_30d", wk),
      title: `Ruta repetida ${i.topRouteRepeat} veces`,
      detail: `${i.topRouteLabel ?? "Una ruta"} se repite ${i.topRouteRepeat} veces en los últimos 90 días.`,
      score: 55,
      routeContext: i.topRouteLabel,
    });
  }

  const prev30 = i.movements.d60 - i.movements.d30;
  if (i.movements.d30 >= config.minMovements && i.movements.d30 > prev30 * 1.5 && prev30 >= 0) {
    out.push({
      kind: "growing_activity",
      dedupeKey: key("growing_activity", wk),
      title: "Actividad creciente",
      detail: `${i.movements.d30} DeCA en 30 días frente a ${prev30} en el periodo anterior.`,
      score: 45,
      routeContext: i.topRouteLabel,
    });
  }

  // --- commercial recovery ---
  if (
    i.state === "review" &&
    (priorityRoute || i.topRouteRepeat >= 3 || i.movements.d30 >= config.minMovements)
  ) {
    out.push({
      kind: "interesting_uncontacted",
      dedupeKey: key("interesting_uncontacted"),
      title: "Transportista interesante sin contactar",
      detail: `${i.companyName} cumple criterios de interés y sigue en "Revisar".`,
      score: 65,
      routeContext: i.topRouteLabel,
    });
  }

  if (OPEN_FOR_FOLLOWUP.includes(i.state)) {
    const ref = i.lastCommercialTouchAt ?? null;
    if (ref && daysBetween(ref, now) >= config.staleFollowUpDays) {
      out.push({
        kind: "interested_no_followup",
        dedupeKey: key("interested_no_followup", wk),
        title: "Sin seguimiento comercial",
        detail: `Última acción hace ${daysBetween(ref, now)} días y el estado sigue abierto ("${i.state}").`,
        score: 75,
        routeContext: i.topRouteLabel,
      });
    }
  }

  if (
    i.routeGapDays !== null &&
    i.routeGapDays >= config.reactivationDays &&
    i.lastActivityAt &&
    daysBetween(i.lastActivityAt, now) <= 14
  ) {
    out.push({
      kind: "reactivated",
      dedupeKey: key("reactivated", wk),
      title: "Activa de nuevo tras una pausa larga",
      detail: `${i.companyName} vuelve a generar DeCA tras ${i.routeGapDays} días sin actividad.`,
      score: 50,
      routeContext: i.topRouteLabel,
    });
  }

  // --- acquisition / referral ---
  if (i.hasAcquisitionOperator && i.firstDecaAt && i.signupAt) {
    if (daysBetween(i.signupAt, now) <= 30) {
      out.push({
        kind: "referral_first_deca",
        dedupeKey: key("referral_first_deca"),
        title: "Registro por operador que ya generó su primer DeCA",
        detail: `${i.companyName} se registró por un operador y ya ha generado su primer DeCA.`,
        score: 40,
        routeContext: null,
      });
    }
  }

  if (
    i.hasAcquisitionOperator &&
    i.movements.d30 >= config.minMovements &&
    i.movements.total >= 3
  ) {
    out.push({
      kind: "acquired_company_recurring",
      dedupeKey: key("acquired_company_recurring", wk),
      title: "Empresa captada con actividad recurrente",
      detail: `${i.companyName} (captada por un operador) alcanza ${i.movements.d30} DeCA en 30 días.`,
      score: 45,
      routeContext: i.topRouteLabel,
    });
  }

  return out;
}
