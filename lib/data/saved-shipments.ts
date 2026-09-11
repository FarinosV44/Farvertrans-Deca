import "server-only";
import { prisma } from "@/lib/prisma";
import { savedShipmentSchema } from "./saved-schema";

/**
 * "Ruta/envío habitual" CRUD (#113 Phase 1) — a reusable single leg that can
 * fill one ENVÍO N block in the multi-shipment wizard (#112). Scoped to the
 * COMPANY, mirroring `lib/data/saved.ts`. Always references two existing
 * `SavedLocation` rows by id — never a free-text address (issue §12).
 * Editing/deleting a route never mutates an already-generated DeCA.
 */

const SAVED_SHIPMENT_ORDER = [
  { favorite: "desc" as const },
  { lastUsedAt: "desc" as const },
  { createdAt: "desc" as const },
];

const WITH_LOCATIONS = {
  loadLocation: true,
  unloadLocation: true,
} as const;

export type SavedShipmentRow = Awaited<ReturnType<typeof listSavedShipments>>[number];

export async function listSavedShipments(companyId: string) {
  return prisma.savedShipment.findMany({
    where: { companyId },
    orderBy: SAVED_SHIPMENT_ORDER,
    include: WITH_LOCATIONS,
  });
}

/** Thrown when a payload names a `SavedLocation` id that doesn't belong to the caller's company. */
export class SavedLocationOwnershipError extends Error {
  constructor() {
    super("One or both locations do not belong to this company.");
    this.name = "SavedLocationOwnershipError";
  }
}

async function assertLocationsOwnedByCompany(
  companyId: string,
  loadLocationId: string,
  unloadLocationId: string,
): Promise<void> {
  const count = await prisma.savedLocation.count({
    where: { companyId, id: { in: [loadLocationId, unloadLocationId] } },
  });
  const distinctIds = new Set([loadLocationId, unloadLocationId]).size;
  if (count < distinctIds) throw new SavedLocationOwnershipError();
}

export async function createSavedShipment(userId: string, companyId: string, input: unknown) {
  const d = savedShipmentSchema.parse(input);
  await assertLocationsOwnedByCompany(companyId, d.loadLocationId, d.unloadLocationId);
  return prisma.savedShipment.create({
    data: {
      userId,
      companyId,
      name: d.name || null,
      loadLocationId: d.loadLocationId,
      unloadLocationId: d.unloadLocationId,
      goods: d.goods || null,
      weight: d.weight || null,
      recipient: d.recipient || null,
    },
    include: WITH_LOCATIONS,
  });
}

/** Update an existing saved shipment in place. Returns false if it does not belong to this company. */
export async function updateSavedShipment(
  companyId: string,
  id: string,
  input: unknown,
): Promise<boolean> {
  const d = savedShipmentSchema.parse(input);
  await assertLocationsOwnedByCompany(companyId, d.loadLocationId, d.unloadLocationId);
  const res = await prisma.savedShipment.updateMany({
    where: { id, companyId },
    data: {
      name: d.name || null,
      loadLocationId: d.loadLocationId,
      unloadLocationId: d.unloadLocationId,
      goods: d.goods || null,
      weight: d.weight || null,
      recipient: d.recipient || null,
    },
  });
  return res.count > 0;
}

/** Delete a saved shipment. Returns false if it does not belong to this company (never throws). */
export async function deleteSavedShipment(companyId: string, id: string): Promise<boolean> {
  const res = await prisma.savedShipment.deleteMany({ where: { id, companyId } });
  return res.count > 0;
}

/** Toggle the company-scoped favourite flag on a saved shipment (#78). */
export async function setSavedShipmentFavorite(
  companyId: string,
  id: string,
  favorite: boolean,
): Promise<boolean> {
  const res = await prisma.savedShipment.updateMany({
    where: { id, companyId },
    data: { favorite },
  });
  return res.count > 0;
}

/**
 * Marks saved shipments as just used (best-effort, mirrors `touchSavedUsage`
 * in lib/data/saved.ts) — never blocks or fails DeCA generation.
 */
export async function touchSavedShipmentUsage(companyId: string, ids: string[]): Promise<void> {
  if (!ids.length) return;
  await prisma.savedShipment.updateMany({
    where: { id: { in: ids }, companyId },
    data: { lastUsedAt: new Date() },
  });
}
