import "server-only";
import { prisma } from "@/lib/prisma";
import { templatePayloadSchema, type TemplateRow } from "./template-schema";

export { templatePayloadSchema, type TemplateInput, type TemplateRow } from "./template-schema";

export async function listTemplates(companyId: string): Promise<TemplateRow[]> {
  const rows = await prisma.decaTemplate.findMany({
    where: { companyId },
    orderBy: [{ favorite: "desc" }, { createdAt: "desc" }], // favourites first (#78)
  });
  return rows.map(
    (r) => ({ id: r.id, favorite: r.favorite, ...(r.dataJson as object) }) as TemplateRow,
  );
}

/** Toggle a template's company-scoped favourite flag (#78). */
export async function setTemplateFavorite(
  companyId: string,
  id: string,
  favorite: boolean,
): Promise<boolean> {
  const res = await prisma.decaTemplate.updateMany({
    where: { id, companyId },
    data: { favorite },
  });
  return res.count > 0;
}

export async function createTemplate(companyId: string, input: unknown): Promise<TemplateRow> {
  const data = templatePayloadSchema.parse(input);
  const row = await prisma.decaTemplate.create({
    data: { companyId, name: data.name, dataJson: data as unknown as object },
  });
  return { id: row.id, favorite: row.favorite, ...data };
}

export async function deleteTemplate(companyId: string, id: string): Promise<void> {
  await prisma.decaTemplate.deleteMany({ where: { id, companyId } });
}
