import { z } from "zod";
import { normalizePlate } from "@/lib/deca/plate";

export const savedKinds = ["company", "vehicle", "address"] as const;
export type SavedKind = (typeof savedKinds)[number];

export const savedCompanySchema = z.object({
  name: z.string().trim().min(2).max(200),
  nif: z.string().trim().min(3).max(20),
  address: z.string().trim().max(300).optional().default(""),
});
export const savedVehicleSchema = z.object({
  tractorPlate: z.string().trim().min(2).max(20).transform(normalizePlate),
  trailerPlate: z
    .string()
    .trim()
    .max(20)
    .transform((v) => (v ? normalizePlate(v) : ""))
    .optional()
    .default(""),
});
export const savedAddressSchema = z.object({
  label: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(300),
});
