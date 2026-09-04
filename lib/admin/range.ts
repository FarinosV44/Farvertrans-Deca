/**
 * Windowed date ranges for the admin filters (ADMIN #33 §11 — "saved filter/date
 * state where reasonable"). Pure: no I/O, safe to unit-test and to import from
 * both server components and route handlers.
 */

export const RANGE_KEYS = ["24h", "7d", "30d", "90d"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];

const RANGE_DAYS: Record<RangeKey, { days: number; label: string }> = {
  "24h": { days: 1, label: "24 h" },
  "7d": { days: 7, label: "7 días" },
  "30d": { days: 30, label: "30 días" },
  "90d": { days: 90, label: "90 días" },
};

export type Range = { since: Date; label: string; value: RangeKey };

/** Resolve a range from a raw query-param value, defaulting to 30 days. */
export function rangeFromParam(v: string | undefined, now: Date = new Date()): Range {
  const key: RangeKey = RANGE_KEYS.includes(v as RangeKey) ? (v as RangeKey) : "30d";
  return {
    since: new Date(now.getTime() - RANGE_DAYS[key].days * 864e5),
    label: RANGE_DAYS[key].label,
    value: key,
  };
}
