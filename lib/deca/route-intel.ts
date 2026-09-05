import "server-only";
import { prisma } from "@/lib/prisma";
import type { ValidatedDeca } from "./validate";

/**
 * Normalized/queryable route data derived from a goods DeCA version (DATA #45).
 *
 * This is a separate, disposable layer from the immutable legal document
 * snapshot (`DecaVersion.dataJson`): losing or recomputing a row here never
 * affects a generated PDF, its QR, or its retention. Writing it is therefore
 * always best-effort and never blocks or fails DeCA generation/correction —
 * the same non-blocking pattern already used for `maybeMarkFirstDeca`.
 */

function foldKey(s: string | undefined): string {
  if (!s) return "";
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toUpperCase();
}

/** e.g. loadCity="Valencia", loadCountry="España", unloadCity="Lyon", unloadCountry="Francia" -> "ESPAÑA-VALENCIA__FRANCIA-LYON" (folded). */
export function routeKeyFor(
  loadCity: string | undefined,
  loadCountry: string | undefined,
  unloadCity: string | undefined,
  unloadCountry: string | undefined,
): string | null {
  if (!loadCity || !unloadCity) return null;
  const from = [loadCountry, loadCity].filter(Boolean).map(foldKey).join("-");
  const to = [unloadCountry, unloadCity].filter(Boolean).map(foldKey).join("-");
  if (!from || !to) return null;
  return `${from}__${to}`;
}

/**
 * Write the derived route-intelligence row for a goods DeCA version. Silently
 * a no-op for a non-goods document (nothing to derive yet — PRODUCT #41 §4
 * passenger schema doesn't exist). Never throws: caught and logged by the
 * caller's best-effort wrapper.
 */
export async function recordRouteIntel(
  decaId: string,
  decaVersionId: string,
  companyId: string | undefined,
  data: ValidatedDeca["data"],
): Promise<void> {
  const load = data.loadLocation;
  const unload = data.unloadLocation;
  if (!load || !unload) return; // not a goods payload

  await prisma.decaRouteIntel.create({
    data: {
      decaId,
      decaVersionId,
      companyId,
      carrierName: data.carrier?.name,
      loadCompanyName: load.name,
      loadCity: load.city,
      loadProvince: load.province,
      loadCountry: load.country,
      loadPostalCode: load.postalCode,
      unloadCompanyName: unload.name,
      unloadCity: unload.city,
      unloadProvince: unload.province,
      unloadCountry: unload.country,
      unloadPostalCode: unload.postalCode,
      loadDate: data.loadDate ? new Date(`${data.loadDate}T00:00:00Z`) : undefined,
      unloadDate: data.unloadDate ? new Date(`${data.unloadDate}T00:00:00Z`) : undefined,
      tractorPlate: data.tractorPlate,
      trailerPlate: data.trailerPlate || undefined,
      routeKey: routeKeyFor(load.city, load.country, unload.city, unload.country) ?? undefined,
    },
  });
}
