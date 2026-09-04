import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * DeCA templates (UX #25) — recurring, non-date data for a lane. Creating a DeCA
 * from a template always produces a brand-new independent document after review;
 * a template never carries a public token or a transport date.
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
    })
    .default({}),
  carrier: z
    .object({
      name: z.string().trim().max(200).default(""),
      nif: z.string().trim().max(20).default(""),
      address: z.string().trim().max(300).default(""),
    })
    .default({}),
  loadLocation: templateLocationSchema,
  unloadLocation: templateLocationSchema,
  goods: z.string().trim().max(300).default(""),
  weight: z.string().trim().max(60).default(""),
  tractorPlate: z.string().trim().max(20).default(""),
  trailerPlate: z.string().trim().max(20).default(""),
});

export type TemplateInput = z.infer<typeof templatePayloadSchema>;

export type TemplateRow = TemplateInput & { id: string };

export async function listTemplates(companyId: string): Promise<TemplateRow[]> {
  const rows = await prisma.decaTemplate.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({ id: r.id, ...(r.dataJson as object) }) as TemplateRow);
}

export async function createTemplate(companyId: string, input: unknown): Promise<TemplateRow> {
  const data = templatePayloadSchema.parse(input);
  const row = await prisma.decaTemplate.create({
    data: { companyId, name: data.name, dataJson: data as unknown as object },
  });
  return { id: row.id, ...data };
}

export async function deleteTemplate(companyId: string, id: string): Promise<void> {
  await prisma.decaTemplate.deleteMany({ where: { id, companyId } });
}
