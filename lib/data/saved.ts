import "server-only";
import { prisma } from "@/lib/prisma";
import {
  savedAddressSchema,
  savedCompanySchema,
  savedVehicleSchema,
  type SavedKind,
} from "./saved-schema";

/** Saved-entity CRUD, always scoped to the owning user (permissions matrix). */
export { savedKinds, type SavedKind } from "./saved-schema";

export async function listSaved(userId: string) {
  const [companies, vehicles, addresses] = await Promise.all([
    prisma.savedCompany.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.savedVehicle.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.savedAddress.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return { companies, vehicles, addresses };
}

export async function createSaved(userId: string, kind: SavedKind, input: unknown) {
  if (kind === "company") {
    const d = savedCompanySchema.parse(input);
    return prisma.savedCompany.create({
      data: { userId, name: d.name, nif: d.nif, address: d.address || null },
    });
  }
  if (kind === "vehicle") {
    const d = savedVehicleSchema.parse(input);
    return prisma.savedVehicle.create({
      data: { userId, tractorPlate: d.tractorPlate, trailerPlate: d.trailerPlate || null },
    });
  }
  const d = savedAddressSchema.parse(input);
  return prisma.savedAddress.create({ data: { userId, label: d.label, address: d.address } });
}

/** Delete a saved entity. Returns false if it is not the user's (never throws for that). */
export async function deleteSaved(userId: string, kind: SavedKind, id: string): Promise<boolean> {
  const where = { id, userId };
  const res =
    kind === "company"
      ? await prisma.savedCompany.deleteMany({ where })
      : kind === "vehicle"
        ? await prisma.savedVehicle.deleteMany({ where })
        : await prisma.savedAddress.deleteMany({ where });
  return res.count > 0;
}
