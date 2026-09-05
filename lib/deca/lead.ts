import { z } from "zod";

/**
 * Lightweight identity gate before an anonymous FIRST DeCA (D-060, restoring
 * TRUST #42 §3 on the owner's explicit instruction, after D-052 required a
 * full account even for the first document). Not part of the compliant
 * document payload — this is who to email the claim link to, never rendered
 * on the PDF. A SECOND anonymous document is not allowed — `fvd_lead` marks
 * that this browser already used its one lead-gated document.
 */
export const LEAD_COOKIE = "fvd_lead";

export const leadSchema = z.object({
  leadName: z.string().trim().min(2, "Indica tu nombre").max(200),
  leadEmail: z.string().trim().toLowerCase().email("Indica un email válido"),
});

export type LeadInput = z.infer<typeof leadSchema>;
