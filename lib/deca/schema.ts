import { z } from "zod";
import { normalizePlate } from "./plate";

/**
 * DeCA data model (R-2 / Art. 6 Orden FOM/2861/2012). Strings are trimmed; the
 * three steps of the wizard map to step1/step2/step3 below and are validated
 * incrementally, then the whole payload is validated once more before generation.
 */

const trimmed = (min: number, max: number, msg: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, msg).max(max));

export const partySchema = z.object({
  name: trimmed(2, 200, "Indica el nombre o razón social"),
  nif: trimmed(3, 20, "Indica el NIF"),
});

export const shipperSchema = partySchema.extend({
  address: trimmed(4, 300, "Indica el domicilio del cargador"),
});

export const step1Schema = z.object({
  shipper: shipperSchema,
  carrier: partySchema,
});

export const step2Schema = z.object({
  origin: trimmed(2, 200, "Indica el lugar de origen"),
  destination: trimmed(2, 200, "Indica el lugar de destino"),
  transportDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha del transporte (AAAA-MM-DD)"),
});

export const step3Schema = z.object({
  goods: trimmed(2, 300, "Describe la mercancía"),
  weight: trimmed(1, 60, "Indica el peso o una medida alternativa"),
  tractorPlate: z
    .string()
    .transform((s) => normalizePlate(s))
    .pipe(z.string().min(2, "Indica la matrícula de la tractora").max(20)),
  trailerPlate: z
    .string()
    .transform((s) => (s ? normalizePlate(s) : ""))
    .pipe(z.string().max(20))
    .optional()
    .or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const decaPayloadSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type DecaPayload = z.infer<typeof decaPayloadSchema>;
export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;
export type Step3 = z.infer<typeof step3Schema>;

export const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema] as const;
