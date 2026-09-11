import "server-only";
import { prisma } from "@/lib/prisma";
import type { ValidatedDeca } from "./validate";
import { resolveShipments } from "./schema";

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
  // #112: one DeCA can now bundle several shipments/legs. Route intelligence
  // stays a single row per DeCA version for this sprint — the first shipment
  // is the representative route, same "first shipment is the summary" choice
  // made for every other list/analytics surface (history, search, admin
  // table). A row per shipment is deferred to #112 Sprint 2.
  const first = resolveShipments(data)[0];
  const load = first?.loadLocation;
  const unload = first?.unloadLocation;
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
      loadDate: first.loadDate ? new Date(`${first.loadDate}T00:00:00Z`) : undefined,
      unloadDate: first.unloadDate ? new Date(`${first.unloadDate}T00:00:00Z`) : undefined,
      tractorPlate: first.tractorPlate,
      trailerPlate: first.trailerPlate || undefined,
      routeKey: routeKeyFor(load.city, load.country, unload.city, unload.country) ?? undefined,
    },
  });
}
