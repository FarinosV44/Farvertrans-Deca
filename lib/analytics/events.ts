import { z } from "zod";

/** The closed set of first-party analytics events (F14 / EPIC 01–02, DESIGN #22, ACCOUNT #23, OPS #26). */
export const EVENT_NAMES = [
  // funnel
  "landing_view",
  "click_crear_deca",
  "deca_started",
  "deca_generated",
  "deca_shared",
  "deca_corrected",
  "claim_completed",
  // landing conversion (#22)
  "hero_cta",
  "header_cta",
  "login_click",
  "persona_section_cta",
  "product_demo_cta",
  "faq_open",
  "final_cta",
  // account (#23)
  "signup_started",
  "signup_completed",
  "company_created",
  "anonymous_deca_claimed",
  "login_completed",
  "first_authenticated_deca",
  // driver delivery / verification (#26)
  "pdf_opened",
  "pdf_downloaded",
  "share_opened",
  "share_whatsapp",
  "share_native",
  "public_link_copied",
  "print_clicked",
  "qr_verify_opened",
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
