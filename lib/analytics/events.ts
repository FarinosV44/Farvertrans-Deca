import { z } from "zod";

/** The closed set of first-party analytics events (F14 / EPIC 01–02). */
export const EVENT_NAMES = [
  "landing_view",
  "click_crear_deca",
  "signup_started",
  "signup_completed",
  "deca_started",
  "deca_generated",
  "deca_shared",
  "deca_corrected",
  "claim_completed",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** UTM + ref keys captured from the entry URL. */
export const REF_KEYS = [
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const eventInputSchema = z.object({
  name: z.enum(EVENT_NAMES),
  sessionId: z.string().min(8).max(64),
  path: z.string().min(1).max(2048),
  ref: z.record(z.string(), z.string()).optional(),
  appVersion: z.string().max(32).optional(),
});

export type EventInput = z.infer<typeof eventInputSchema>;

/** Extract only the known ref/utm keys from a URLSearchParams-like object. */
export function pickRefSnapshot(
  params: URLSearchParams | Record<string, string | undefined>,
): Record<string, string> {
  const get = (k: string) => (params instanceof URLSearchParams ? params.get(k) : params[k]);
  const out: Record<string, string> = {};
  for (const k of REF_KEYS) {
    const v = get(k);
    if (typeof v === "string" && v.length > 0 && v.length <= 200) out[k] = v;
  }
  return out;
}
