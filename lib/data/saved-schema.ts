import { z } from "zod";
import { normalizePlate } from "@/lib/deca/plate";
import { upperText, upperTextOrEmpty } from "@/lib/text/normalize";

export const savedKinds = ["company", "vehicle", "location"] as const;
export type SavedKind = (typeof savedKinds)[number];

export const savedPartyRoles = ["shipper", "carrier", "both"] as const;
export type SavedPartyRole = (typeof savedPartyRoles)[number];

export const savedLocationTypes = ["load", "unload", "both"] as const;
export type SavedLocationType = (typeof savedLocationTypes)[number];

// Field lengths mirror the DeCA's own party/location schemas (lib/deca/schema.ts,
// lib/deca/location.ts) so a saved record is always usable verbatim, never
// "successfully saved" yet still incomplete for the document that needs it.
// Operational descriptive fields are stored UPPERCASE (#86 part 3); NIF, phone
// and email keep their exact casing (email is case-sensitive; NIF is an
// identifier).
export const savedCompanySchema = z.object({
  name: z.string().trim().min(2).max(200).transform(upperText),
  nif: z.string().trim().min(3).max(20),
  address: z.string().trim().min(4).max(300).transform(upperText),
  // Mandatory (#86 part 2 — reverses #85/D-148's "optional"): a saved contact
  // always carries its full domicilio so the DeCA "CP población" line is
  // filled on reuse without retyping. Bounds match `savedLocationSchema`.
  postalCode: z
    .string()
    .trim()
    .min(3, "El código postal es obligatorio.")
    .max(12)
    .transform(upperText),
  city: z.string().trim().min(2, "La población es obligatoria.").max(120).transform(upperText),
  contactName: z.string().trim().max(200).optional().default("").transform(upperTextOrEmpty),
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
  alias: z.string().trim().max(80).optional().default("").transform(upperTextOrEmpty),
});
export const savedLocationSchema = z.object({
  name: z.string().trim().min(2).max(200).transform(upperText),
  address: z.string().trim().min(4).max(300).transform(upperText),
  postalCode: z.string().trim().min(3).max(12).transform(upperText),
  city: z.string().trim().min(2).max(120).transform(upperText),
  // Optional, like the DeCA location schema (#75).
  province: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined),
    z.string().min(2).max(120).transform(upperText).optional(),
  ),
  country: z.string().trim().min(2).max(80).optional().default("España").transform(upperText),
  type: z.enum(savedLocationTypes).optional().default("both"),
});

// #113 Phase 1 — "Ruta/envío habitual": one reusable leg, referencing two
// existing SavedLocation rows by id (never a free-text address, §12).
// Bounds mirror lib/deca/schema.ts's `shipmentSchema` so a saved route is
// always usable verbatim once dropped into an ENVÍO N block.
export const savedShipmentSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  loadLocationId: z.string().trim().min(1, "Selecciona el lugar de carga."),
  unloadLocationId: z.string().trim().min(1, "Selecciona el lugar de descarga."),
  goods: z.string().trim().max(300).optional().default("").transform(upperTextOrEmpty),
  weight: z.string().trim().max(60).optional().default(""),
  recipient: z.string().trim().max(200).optional().default("").transform(upperTextOrEmpty),
});
