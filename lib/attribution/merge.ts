import { parseTouch, touchIsQualifying, type Touch } from "./parse";

export type Attribution = {
  first: Touch | null;
  last: Touch | null;
  lockedAt: string | null; // set once the acquisition row is written (signup); first can never change after
};

export const EMPTY_ATTRIBUTION: Attribution = { first: null, last: null, lockedAt: null };

/**
 * Merge a new touch into stored attribution. Rules (F12 / EPIC 02):
 * - first-touch is captured once and NEVER overwritten after it exists;
 * - last-touch is updated by each new *qualifying* touch, but only while unlocked
 *   (before signup);
 * - once `lockedAt` is set, nothing changes.
 */
export function mergeTouch(current: Attribution, incoming: Touch): Attribution {
  if (current.lockedAt) return current;

  const next: Attribution = { ...current };
  if (!next.first) {
    next.first = incoming;
    next.last = incoming;
    return next;
  }
  if (touchIsQualifying(incoming)) {
    next.last = incoming;
  }
  return next;
}

/** Convenience for the client capture path. */
export function mergeFromUrl(
  current: Attribution,
  url: URL,
  referrer: string | null,
  now: Date = new Date(),
): Attribution {
  const touch = parseTouch(url.searchParams, {
    landingUrl: url.pathname + url.search,
    referrer,
    now,
  });
  return mergeTouch(current, touch);
}

/** Lock attribution at signup — first-touch is now permanent. */
export function lock(current: Attribution, now: Date = new Date()): Attribution {
  return { ...current, lockedAt: current.lockedAt ?? now.toISOString() };
}

/** Flatten to the `acquisition` table columns. */
export function toAcquisitionRow(a: Attribution) {
  const f = a.first;
  const l = a.last;
  return {
    firstRefCode: f?.ref ?? null,
    lastRefCode: l?.ref ?? null,
    firstLandingUrl: f?.landingUrl ?? null,
    firstUtmSource: f?.utm.utm_source ?? null,
    firstUtmMedium: f?.utm.utm_medium ?? null,
    firstUtmCampaign: f?.utm.utm_campaign ?? null,
    firstUtmContent: f?.utm.utm_content ?? null,
    firstUtmTerm: f?.utm.utm_term ?? null,
    lastUtmSource: l?.utm.utm_source ?? null,
    lastUtmMedium: l?.utm.utm_medium ?? null,
    lastUtmCampaign: l?.utm.utm_campaign ?? null,
    lastUtmContent: l?.utm.utm_content ?? null,
    lastUtmTerm: l?.utm.utm_term ?? null,
    firstSeenAt: f?.at ? new Date(f.at) : null,
  };
}
