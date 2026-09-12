import "server-only";
import { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/lib/prisma";
import {
  savedCompanySchema,
  savedLocationSchema,
  savedVehicleSchema,
  type SavedKind,
} from "./saved-schema";

/**
 * #133: a `SavedLocation` still referenced by a `SavedShipment` is
 * DB-level RESTRICTed (see the schema's own comment on `SavedShipment`) —
 * deleting it must surface a clear message, not a raw Prisma error.
 */
export class SavedInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedInUseError";
  }
}

/**
 * Saved-entity CRUD (WORKSPACE #24). Scoped to the COMPANY — a shared team
 * resource (TEAM #27), not a private per-user list. `userId` is recorded as
 * the creator for audit only; every read/write/delete is authorized against
 * `companyId`. Editing or deleting a saved record never mutates an
 * already-generated DeCA — each document holds its own copy of the data.
 */
export { savedKinds, type SavedKind } from "./saved-schema";

// Favourites first (#78), then most-recently-used, then newest.
const SAVED_ORDER = [
  { favorite: "desc" as const },
  { lastUsedAt: "desc" as const },
  { createdAt: "desc" as const },
];

export async function listSaved(companyId: string) {
  const [companies, vehicles, locations] = await Promise.all([
    prisma.savedCompany.findMany({ where: { companyId }, orderBy: SAVED_ORDER }),
    prisma.savedVehicle.findMany({ where: { companyId }, orderBy: SAVED_ORDER }),
    prisma.savedLocation.findMany({ where: { companyId }, orderBy: SAVED_ORDER }),
  ]);
  return { companies, vehicles, locations };
}

/** Toggle the company-scoped favourite flag on a saved record (#78). */
export async function setSavedFavorite(
  companyId: string,
  kind: SavedKind,
  id: string,
  favorite: boolean,
): Promise<boolean> {
  const where = { id, companyId };
  const data = { favorite };
  const res =
    kind === "company"
      ? await prisma.savedCompany.updateMany({ where, data })
      : kind === "vehicle"
        ? await prisma.savedVehicle.updateMany({ where, data })
        : await prisma.savedLocation.updateMany({ where, data });
  return res.count > 0;
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
        postalCode: d.postalCode || null,
        city: d.city || null,
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

/**
 * Update an existing saved entity IN PLACE (#86 part 1 — "Editar", not
 * delete-and-recreate). The row keeps its `id`, `companyId`, `userId`
 * (original creator), `favorite` and `lastUsedAt`; only the user-editable
 * fields are replaced, validated by the same schema as `createSaved`. Scoped
 * to the company. Returns false if the id does not belong to this company.
 * Never mutates an already-generated DeCA — each document holds its own copy.
 */
export async function updateSaved(
  companyId: string,
  kind: SavedKind,
  id: string,
  input: unknown,
): Promise<boolean> {
  const where = { id, companyId };
  if (kind === "company") {
    const d = savedCompanySchema.parse(input);
    const res = await prisma.savedCompany.updateMany({
      where,
      data: {
        name: d.name,
        nif: d.nif,
        address: d.address || null,
        postalCode: d.postalCode,
        city: d.city,
        contactName: d.contactName || null,
        contactPhone: d.contactPhone || null,
        contactEmail: d.contactEmail || null,
        role: d.role,
      },
    });
    return res.count > 0;
  }
  if (kind === "vehicle") {
    const d = savedVehicleSchema.parse(input);
    const res = await prisma.savedVehicle.updateMany({
      where,
      data: {
        tractorPlate: d.tractorPlate,
        trailerPlate: d.trailerPlate || null,
        alias: d.alias || null,
      },
    });
    return res.count > 0;
  }
  const d = savedLocationSchema.parse(input);
  const res = await prisma.savedLocation.updateMany({
    where,
    data: {
      name: d.name,
      address: d.address,
      postalCode: d.postalCode || null,
      city: d.city || null,
      province: d.province || null,
      country: d.country || "España",
      type: d.type,
    },
  });
  return res.count > 0;
}

/** Delete a saved entity. Returns false if it does not belong to this company (never throws). */
export async function deleteSaved(
  companyId: string,
  kind: SavedKind,
  id: string,
): Promise<boolean> {
  const where = { id, companyId };
  try {
    const res =
      kind === "company"
        ? await prisma.savedCompany.deleteMany({ where })
        : kind === "vehicle"
          ? await prisma.savedVehicle.deleteMany({ where })
          : await prisma.savedLocation.deleteMany({ where });
    return res.count > 0;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      throw new SavedInUseError(
        "Este lugar está en uso en una ruta habitual guardada. Elimina o edita esa ruta primero.",
      );
    }
    throw e;
  }
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
