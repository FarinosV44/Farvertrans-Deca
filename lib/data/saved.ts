import "server-only";
import { prisma } from "@/lib/prisma";
import {
  savedCompanySchema,
  savedLocationSchema,
  savedVehicleSchema,
  type SavedKind,
} from "./saved-schema";

/**
 * Saved-entity CRUD (WORKSPACE #24). Scoped to the COMPANY — a shared team
 * resource (TEAM #27), not a private per-user list. `userId` is recorded as
 * the creator for audit only; every read/write/delete is authorized against
 * `companyId`. Editing or deleting a saved record never mutates an
 * already-generated DeCA — each document holds its own copy of the data.
 */
export { savedKinds, type SavedKind } from "./saved-schema";

export async function listSaved(companyId: string) {
  const [companies, vehicles, locations] = await Promise.all([
    prisma.savedCompany.findMany({
      where: { companyId },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.savedVehicle.findMany({
      where: { companyId },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.savedLocation.findMany({
      where: { companyId },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  return { companies, vehicles, locations };
}

export async function createSaved(
  userId: string,
  companyId: string,
  kind: SavedKind,
  input: unknown,
) {
  if (kind === "company") {
    const d = savedCompanySchema.parse(input);
    return prisma.savedCompany.create({
      data: {
        userId,
        companyId,
        name: d.name,
        nif: d.nif,
        address: d.address || null,
        contactName: d.contactName || null,
        contactPhone: d.contactPhone || null,
        contactEmail: d.contactEmail || null,
        role: d.role,
      },
    });
  }
  if (kind === "vehicle") {
    const d = savedVehicleSchema.parse(input);
    return prisma.savedVehicle.create({
      data: {
        userId,
        companyId,
        tractorPlate: d.tractorPlate,
        trailerPlate: d.trailerPlate || null,
        alias: d.alias || null,
      },
    });
  }
  const d = savedLocationSchema.parse(input);
  return prisma.savedLocation.create({
    data: {
      userId,
      companyId,
      name: d.name,
      address: d.address,
      postalCode: d.postalCode || null,
      city: d.city || null,
      province: d.province || null,
      country: d.country || "España",
      type: d.type,
    },
  });
}

/** Delete a saved entity. Returns false if it does not belong to this company (never throws). */
export async function deleteSaved(
  companyId: string,
  kind: SavedKind,
  id: string,
): Promise<boolean> {
  const where = { id, companyId };
  const res =
    kind === "company"
      ? await prisma.savedCompany.deleteMany({ where })
      : kind === "vehicle"
        ? await prisma.savedVehicle.deleteMany({ where })
        : await prisma.savedLocation.deleteMany({ where });
  return res.count > 0;
}

/**
 * Marks a saved entity as just used (WORKSPACE #24 "last used" + so the most
 * relevant records sort first). Best-effort — never blocks or fails DeCA
 * generation if the id doesn't resolve (e.g. it was typed fresh, not picked
 * from a dropdown) or belongs to a different company.
 */
export async function touchSavedUsage(
  companyId: string,
  picks: { companyIds?: string[]; vehicleId?: string; locationIds?: string[] },
): Promise<void> {
  const now = new Date();
  await Promise.all([
    picks.companyIds && picks.companyIds.length
      ? prisma.savedCompany.updateMany({
          where: { id: { in: picks.companyIds }, companyId },
          data: { lastUsedAt: now },
        })
      : Promise.resolve(),
    picks.vehicleId
      ? prisma.savedVehicle.updateMany({
          where: { id: picks.vehicleId, companyId },
          data: { lastUsedAt: now },
        })
      : Promise.resolve(),
    picks.locationIds && picks.locationIds.length
      ? prisma.savedLocation.updateMany({
          where: { id: { in: picks.locationIds }, companyId },
          data: { lastUsedAt: now },
        })
      : Promise.resolve(),
  ]);
}
