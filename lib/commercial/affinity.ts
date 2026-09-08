/**
 * "Afinidad Farvertrans" — a transparent, rule-based commercial-fit score for a
 * carrier (#88). NOT an opaque model and NOT external AI: every point comes
 * from one documented rule over data the product already stores, and the result
 * always carries the breakdown that produced it.
 *
 * Pure module: no I/O, no `server-only`. Unit-tested directly.
 */

import type { ActivityTrend } from "@/lib/commercial/activity";

export type AffinityInput = {
  /** DeCA in the last 7 / 30 / 90 days. */
  d7: number;
  d30: number;
  d90: number;
  /** Total DeCA observed for this carrier. */
  total: number;
  trend: ActivityTrend;
  /** Whole days since the first observed DeCA, or null when there is none. */
  daysSinceFirst: number | null;
  /** Highest repeat count of a single corridor over the window. */
  topRouteRepeat: number;
  /** Distinct route corridors (routeKeys) observed. */
  distinctRoutes: number;
  /** Corridor ids of interest this carrier touches (`lib/commercial/corridors.ts`). */
  corridorIds: string[];
  /** The carrier authorised a contact channel AND a value for it. */
  hasAuthorisedContact: boolean;
  consentMode: "per_deca" | "all";
  /** Optional manual input: already a known Farvertrans provider/client. */
  knownRelationship?: boolean;
};

export type AffinityRule = { label: string; points: number };
export type AffinityBand = "Alta" | "Media" | "Baja";
export type AffinityResult = {
  score: number;
  band: AffinityBand;
  breakdown: AffinityRule[];
};

const CORRIDOR_LABEL_HINT: Record<string, string> = {
  "es-francia": "Francia",
  "es-benelux": "Benelux",
  "es-italia": "Italia",
  "es-alemania": "Alemania",
  "es-portugal": "Portugal",
};

/** The score plus the exact list of rules that produced it. */
export function affinityScore(input: AffinityInput): AffinityResult {
  const rules: AffinityRule[] = [];
  const add = (label: string, points: number) => {
    if (points !== 0) rules.push({ label, points });
  };

  if (input.d7 > 0) add("Actividad en los últimos 7 días", 20);
  if (input.d30 >= 2) add("Recurrencia: 2+ DeCA en 30 días", 15);
  if (input.trend === "up" || input.trend === "new") add("Tendencia de uso al alza", 10);
  if (input.topRouteRepeat >= 3) add("Ruta recurrente estable (3+ repeticiones)", 15);

  if (input.corridorIds.length >= 1) {
    add("Coincide con un corredor de interés", 15);
    if (input.corridorIds.length >= 2) add("Opera 2+ corredores de interés", 5);
  }

  if (input.hasAuthorisedContact) add("Canal de contacto comercial autorizado", 10);
  if (input.consentMode === "all") add("Consentimiento para todos los portes", 10);
  if (input.knownRelationship) add("Relación previa con Farvertrans", 10);

  if (input.d90 === 0) add("Sin actividad en los últimos 90 días", -15);
  if (input.trend === "down") add("Tendencia de uso a la baja", -10);

  const raw = rules.reduce((n, r) => n + r.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  const band: AffinityBand = score >= 70 ? "Alta" : score >= 40 ? "Media" : "Baja";
  return { score, band, breakdown: rules };
}

/**
 * Objective usage labels for the carrier (#88). Every tag is a boolean rule
 * over the same input — nothing subjective, nothing invented.
 */
export function autoTags(input: AffinityInput): string[] {
  const tags: string[] = [];
  if (input.d30 >= 8) tags.push("Muy activo");
  else if (input.d7 > 0) tags.push("Actividad reciente");

  for (const id of input.corridorIds) {
    const hint = CORRIDOR_LABEL_HINT[id];
    if (hint) tags.push(`Recurrente ${hint}`);
  }

  if (input.topRouteRepeat >= 3) tags.push("Ruta estable");
  if (input.total > 0 && input.total <= 2 && (input.daysSinceFirst ?? 999) <= 30)
    tags.push("Nuevo transportista");
  if (input.total > 0 && input.d90 === 0) tags.push("Sin actividad 90d");

  // de-duplicate while preserving order
  return [...new Set(tags)];
}
