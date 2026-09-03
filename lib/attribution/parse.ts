export const ATTR_COOKIE = "fvd_attr";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export type Touch = {
  ref: string | null;
  utm: Partial<Record<UtmKey, string>>;
  landingUrl: string;
  referrer: string | null;
  at: string; // ISO
  channel: "referral" | "campaign" | "organic" | "direct";
};

function clean(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= 200 ? t : null;
}

/**
 * Extract an acquisition touch from an entry URL + referrer. Pure.
 * channel: `referral` (has ref) > `campaign` (has any UTM) > `organic` (has a
 * referrer from another host) > `direct`.
 */
export function parseTouch(
  params: URLSearchParams | Record<string, string | undefined>,
  opts: { landingUrl: string; referrer?: string | null; now?: Date } = { landingUrl: "/" },
): Touch {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.get(k) : (params[k] ?? null);

  const ref = clean(get("ref"));
  const utm: Partial<Record<UtmKey, string>> = {};
  for (const k of UTM_KEYS) {
    const v = clean(get(k));
    if (v) utm[k] = v;
  }
  const referrer = clean(opts.referrer ?? null);

  let channel: Touch["channel"];
  if (ref) channel = "referral";
  else if (Object.keys(utm).length > 0) channel = "campaign";
  else if (referrer) channel = "organic";
  else channel = "direct";

  return {
    ref,
    utm,
    landingUrl: opts.landingUrl.slice(0, 500),
    referrer: referrer ? referrer.slice(0, 300) : null,
    at: (opts.now ?? new Date()).toISOString(),
    channel,
  };
}

/** Does a touch carry any attribution signal worth recording as a "last touch"? */
export function touchIsQualifying(t: Touch): boolean {
  return t.channel === "referral" || t.channel === "campaign";
}
