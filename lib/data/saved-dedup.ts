import { normalizePlate } from "@/lib/deca/plate";
import { upperText } from "@/lib/text/normalize";

/**
 * #113 §13 — soft duplicate detection for "Datos habituales". Exact-match
 * only, never fuzzy: a false positive would block a legitimate save with
 * confusing noise, so every check compares normalized values for EQUALITY,
 * the same normalization each kind's own schema already applies on save
 * (`upperText`/`normalizePlate`) — this just runs it client-side, before the
 * network round-trip, so the warning can show without waiting on a 201.
 * Pure and side-effect-free: the caller decides what to do with a match
 * (warn, never block — the record is still saved if the operator confirms).
 */

const norm = (s: string | null | undefined) => (s ? upperText(s) : "");

type CompanyLike = { id: string; name: string; nif: string | null; address: string | null };
export function findDuplicateCompany<T extends CompanyLike>(
  existing: T[],
  candidate: { name?: string; nif?: string; address?: string },
): T | undefined {
  const nif = norm(candidate.nif);
  const nameAddr = `${norm(candidate.name)}|${norm(candidate.address)}`;
  return existing.find(
    (c) => (nif && norm(c.nif) === nif) || `${norm(c.name)}|${norm(c.address)}` === nameAddr,
  );
}

type VehicleLike = { id: string; tractorPlate: string };
export function findDuplicateVehicle<T extends VehicleLike>(
  existing: T[],
  candidate: { tractorPlate?: string },
): T | undefined {
  const plate = candidate.tractorPlate ? normalizePlate(candidate.tractorPlate) : "";
  if (!plate) return undefined;
  return existing.find((v) => normalizePlate(v.tractorPlate) === plate);
}

type LocationLike = { id: string; address: string; postalCode: string | null; city: string | null };
export function findDuplicateLocation<T extends LocationLike>(
  existing: T[],
  candidate: { address?: string; postalCode?: string; city?: string },
): T | undefined {
  const key = `${norm(candidate.address)}|${norm(candidate.postalCode)}|${norm(candidate.city)}`;
  return existing.find((l) => `${norm(l.address)}|${norm(l.postalCode)}|${norm(l.city)}` === key);
}

type ShipmentLike = { id: string; loadLocationId: string; unloadLocationId: string };
export function findDuplicateShipment<T extends ShipmentLike>(
  existing: T[],
  candidate: { loadLocationId?: string; unloadLocationId?: string },
): T | undefined {
  if (!candidate.loadLocationId || !candidate.unloadLocationId) return undefined;
  return existing.find(
    (s) =>
      s.loadLocationId === candidate.loadLocationId &&
      s.unloadLocationId === candidate.unloadLocationId,
  );
}
