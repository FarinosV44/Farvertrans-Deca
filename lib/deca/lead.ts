import { z } from "zod";

/**
 * Lightweight identity gate before an anonymous first DeCA (TRUST #42 §3).
 * Not part of the compliant document payload — this is who to email the
 * claim link to, never rendered on the PDF.
 */
export const LEAD_COOKIE = "fvd_lead";

export const leadSchema = z.object({
  leadName: z
    .string()
    .trim()
    .min(2, "Indica tu nombre")
    .max(200),
  leadEmail: z.string().trim().toLowerCase().email("Indica un email válido"),
});

export type LeadInput = z.infer<typeof leadSchema>;
