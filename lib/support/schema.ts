import { z } from "zod";

/**
 * Technical-support ticket input (#86 part 5). Legal queries are NOT tickets
 * (#86 part 6) — they never reach this schema.
 */

export const SUPPORT_CATEGORIES = [
  "generacion",
  "cuenta",
  "empresa_equipo",
  "documento",
  "otro",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_CATEGORY_LABEL: Record<SupportCategory, string> = {
  generacion: "Generación de DeCA",
  cuenta: "Cuenta y acceso",
  empresa_equipo: "Empresa y equipo",
  documento: "Un documento concreto",
  otro: "Otro",
};

export const SUPPORT_STATUSES = [
  "new",
  "in_review",
  "awaiting_user",
  "resolved",
  "closed",
] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  new: "Nueva",
  in_review: "En revisión",
  awaiting_user: "Pendiente de usuario",
  resolved: "Resuelta",
  closed: "Cerrada",
};

export const createTicketSchema = z.object({
  category: z.enum(SUPPORT_CATEGORIES),
  subject: z.string().trim().min(4, "Resume el problema en el asunto.").max(160),
  body: z.string().trim().min(10, "Cuéntanos qué ocurre con algo más de detalle.").max(5000),
});

export const ticketReplySchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const adminTicketUpdateSchema = z
  .object({
    body: z.string().trim().min(1).max(5000).optional(),
    status: z.enum(SUPPORT_STATUSES).optional(),
  })
  .refine((d) => d.body !== undefined || d.status !== undefined, {
    message: "Nada que actualizar.",
  });
