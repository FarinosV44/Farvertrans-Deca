import { z } from "zod";
import { shipmentSchema } from "@/lib/deca/schema";

/**
 * DeCA templates (UX #25) — recurring, non-date data for a lane. Creating a DeCA
 * from a template always produces a brand-new independent document after review;
 * a template never carries a public token or a transport date. Split out from
 * `lib/data/templates.ts` (which is `server-only`) so the pure schema stays
 * unit-testable, mirroring the `saved-schema.ts` / `saved.ts` split.
 */
const templateLocationSchema = z
  .object({
    name: z.string().trim().max(200).default(""),
    address: z.string().trim().max(300).default(""),
    postalCode: z.string().trim().max(12).default(""),
    city: z.string().trim().max(120).default(""),
    province: z.string().trim().max(120).default(""),
    country: z.string().trim().max(80).default(""),
  })
  .default({});

export const templatePayloadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shipper: z
    .object({
      name: z.string().trim().max(200).default(""),
      nif: z.string().trim().max(20).default(""),
      address: z.string().trim().max(300).default(""),
      postalCode: z.string().trim().max(12).default(""),
      city: z.string().trim().max(120).default(""),
    })
    .default({}),
  carrier: z
    .object({
      name: z.string().trim().max(200).default(""),
      nif: z.string().trim().max(20).default(""),
      address: z.string().trim().max(300).default(""),
      postalCode: z.string().trim().max(12).default(""),
      city: z.string().trim().max(120).default(""),
    })
    .default({}),
  loadLocation: templateLocationSchema,
  unloadLocation: templateLocationSchema,
  goods: z.string().trim().max(300).default(""),
  weight: z.string().trim().max(60).default(""),
  tractorPlate: z.string().trim().max(20).default(""),
  trailerPlate: z.string().trim().max(20).default(""),
  // #113 §5 — shipments BEYOND the first, for a whole recurring multi-envío
  // lane ("REPARTO MADRID"). Always sourced from an already-generated,
  // already-validated DeCA (via "Guardar como plantilla" on its detail page),
  // so the strict `shipmentSchema` (same one #112 uses for a real DeCA) is
  // the right validation here too — never a partial/lenient shape.
  shipments: z.array(shipmentSchema).optional(),
});

export type TemplateInput = z.infer<typeof templatePayloadSchema>;

export type TemplateRow = TemplateInput & { id: string; favorite: boolean };
