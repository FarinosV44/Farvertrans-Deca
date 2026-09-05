import { z } from "zod";
import { normalizePlate } from "@/lib/deca/plate";

export const savedKinds = ["company", "vehicle", "location"] as const;
export type SavedKind = (typeof savedKinds)[number];

export const savedPartyRoles = ["shipper", "carrier", "both"] as const;
export type SavedPartyRole = (typeof savedPartyRoles)[number];

export const savedLocationTypes = ["load", "unload", "both"] as const;
export type SavedLocationType = (typeof savedLocationTypes)[number];

// Field lengths mirror the DeCA's own party/location schemas (lib/deca/schema.ts,
// lib/deca/location.ts) so a saved record is always usable verbatim, never
// "successfully saved" yet still incomplete for the document that needs it.
export const savedCompanySchema = z.object({
  name: z.string().trim().min(2).max(200),
  nif: z.string().trim().min(3).max(20),
  address: z.string().trim().min(4).max(300),
  contactName: z.string().trim().max(200).optional().default(""),
  contactPhone: z.string().trim().max(40).optional().default(""),
  contactEmail: z.string().trim().max(200).optional().default(""),
  role: z.enum(savedPartyRoles).optional().default("both"),
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
  alias: z.string().trim().max(80).optional().default(""),
});
export const savedLocationSchema = z.object({
  name: z.string().trim().min(2).max(200),
  address: z.string().trim().min(4).max(300),
  postalCode: z.string().trim().min(3).max(12),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(80).optional().default("España"),
  type: z.enum(savedLocationTypes).optional().default("both"),
});
