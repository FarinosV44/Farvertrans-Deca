/**
 * Pure activity summary over a set of event timestamps (#87 / #88).
 *
 * Given the dates a carrier generated DeCA (or any dated events), produce the
 * recurrence figures the commercial views need: rolling-window counts, first/
 * last seen, the trend vs. the previous period, and a weekday histogram. No
 * I/O, no `server-only` — unit-tested directly.
 */

export type ActivityTrend = "up" | "down" | "flat" | "new" | "none";

export type ActivitySummary = {
  total: number;
  d7: number;
  d30: number;
  d60: number;
  d90: number;
  /** DeCA in the 30–60 day window (the period before the last 30 days). */
  prev30: number;
  trend: ActivityTrend;
  firstAt: Date | null;
  lastAt: Date | null;
  /** Whole days between `lastAt` and `now`, or null when there is no activity. */
  daysSinceLast: number | null;
  /** 7 buckets, index 0 = Sunday … 6 = Saturday (UTC). */
  weekday: number[];
  /** Index of the busiest weekday, or null when there is no activity. */
  busiestWeekday: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function summariseActivity(dates: Date[], now: Date = new Date()): ActivitySummary {
  const nowMs = now.getTime();
  const valid = dates
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
    .filter((d) => d.getTime() <= nowMs) // future-dated events are ignored entirely
    .sort((a, b) => a.getTime() - b.getTime());

  const weekday = [0, 0, 0, 0, 0, 0, 0];
  let d7 = 0;
  let d30 = 0;
  let d60 = 0;
  let d90 = 0;
  let prev30 = 0;

  for (const d of valid) {
    const age = nowMs - d.getTime();
    if (age <= 7 * DAY_MS) d7 += 1;
    if (age <= 30 * DAY_MS) d30 += 1;
    if (age <= 60 * DAY_MS) d60 += 1;
    if (age <= 90 * DAY_MS) d90 += 1;
    if (age > 30 * DAY_MS && age <= 60 * DAY_MS) prev30 += 1;
    weekday[d.getUTCDay()] += 1;
  }

  const firstAt = valid[0] ?? null;
  const lastAt = valid.length ? valid[valid.length - 1] : null;
  const daysSinceLast = lastAt ? Math.floor((nowMs - lastAt.getTime()) / DAY_MS) : null;

  let trend: ActivityTrend;
  if (valid.length === 0) trend = "none";
  else if (prev30 === 0 && d30 > 0) trend = "new";
  else if (d30 > prev30) trend = "up";
  else if (d30 < prev30) trend = "down";
  else trend = "flat";

  let busiestWeekday: number | null = null;
  if (valid.length) {
    let best = -1;
    for (let i = 0; i < 7; i++) {
      if (weekday[i] > best) {
        best = weekday[i];
        busiestWeekday = i;
      }
    }
  }

  return {
    total: valid.length,
    d7,
    d30,
    d60,
    d90,
    prev30,
    trend,
    firstAt,
    lastAt,
    daysSinceLast,
    weekday,
    busiestWeekday,
  };
}
