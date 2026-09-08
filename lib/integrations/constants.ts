import { z } from "zod";

/** Pure (client-safe) constants + schema for the integration request (#74). */

export const NEEDS = [
  "crear_deca",
  "consultar_estado",
  "descargar_pdf",
  "importar_datos",
  "otra",
] as const;

export type Need = (typeof NEEDS)[number];

export const NEED_LABEL: Record<Need, string> = {
  crear_deca: "Crear DeCA automáticamente",
  consultar_estado: "Consultar estado",
  descargar_pdf: "Descargar PDF / QR",
  importar_datos: "Importar datos",
  otra: "Otra",
};

export const integrationRequestSchema = z.object({
  system: z.string().trim().min(2, "Indica el sistema / TMS / ERP").max(120),
  need: z.enum(NEEDS),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email("Correo no válido").max(160).optional().or(z.literal("")),
  volumeNote: z.string().trim().max(120).optional(),
});

export const INTEGRATION_STATUSES = ["new", "reviewed", "contact", "discarded"] as const;
