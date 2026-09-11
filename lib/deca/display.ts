import { upperText } from "@/lib/text/normalize";

/**
 * Presentation normalisation for a generated DeCA (#86 p3, extended by the
 * 2026-09-08 FIX). EVERY textual, human-entered field of the document renders
 * in UPPERCASE so the PDF, the web detail, Modo Inspección, the review step and
 * the history all look like one uniform professional document — regardless of
 * how the operator typed it.
 *
 * This is a PRESENTATION transform: the stored `data_json` keeps the original
 * casing (the legal/versioned content is never rewritten), and every read site
 * applies this before showing it. It is idempotent.
 *
 * NEVER touched — semantics or matching would break, or the value is not a
 * free-text label:
 *   - emails, URLs, the public `/d/` URL, QR payloads, tokens, hashes, UUIDs
 *   - NIF / CIF / VAT, postal codes, document numbers
 *   - weights / measures (kept verbatim by the DeCA engine already)
 *   - dates, amounts
 * Plates ARE uppercase, but they arrive already normalised (`normalizePlate`);
 * this transform leaves them as-is.
 */

const up = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? upperText(v) : (v as string | undefined);

type PartyLike =
  | {
      name?: string | null;
      nif?: string | null;
      address?: string | null;
      postalCode?: string | null;
      city?: string | null;
    }
  | null
  | undefined;

type LocationLike =
  | {
      name?: string | null;
      address?: string | null;
      postalCode?: string | null;
      city?: string | null;
      province?: string | null;
      country?: string | null;
    }
  | null
  | undefined;

function upperParty<T extends PartyLike>(p: T): T {
  if (!p) return p;
  return { ...p, name: up(p.name), address: up(p.address), city: up(p.city) } as T;
}

function upperLocation<T extends LocationLike>(l: T): T {
  if (!l) return l;
  return {
    ...l,
    name: up(l.name),
    address: up(l.address),
    city: up(l.city),
    province: up(l.province),
    country: up(l.country),
  } as T;
}

/** Uppercase one shipment's own visible textual fields (#112). Shared by the
 *  top-level mirror (shipment 1, via the fields below) and every entry in
 *  `shipments[]`. */
function upperShipment<
  T extends {
    loadLocation?: LocationLike;
    unloadLocation?: LocationLike;
    goods?: unknown;
    recipient?: unknown;
    notes?: unknown;
  },
>(s: T): T {
  const out = { ...s };
  if (out.loadLocation && typeof out.loadLocation === "object") {
    out.loadLocation = upperLocation(out.loadLocation);
  }
  if (out.unloadLocation && typeof out.unloadLocation === "object") {
    out.unloadLocation = upperLocation(out.unloadLocation);
  }
  if ("goods" in out) out.goods = up(out.goods) as T["goods"];
  if ("recipient" in out) out.recipient = up(out.recipient) as T["recipient"];
  if ("notes" in out) out.notes = up(out.notes) as T["notes"];
  return out;
}

/**
 * Return a copy of a DeCA payload (or the looser stored shape) with every
 * visible textual field uppercased. Tolerant of missing keys — safe on a
 * partial `data_json`.
 */
export function toDisplayDeca<T extends Record<string, unknown>>(data: T): T {
  if (!data || typeof data !== "object") return data;
  const out: Record<string, unknown> = { ...data };
  if ("shipper" in out) out.shipper = upperParty(out.shipper as PartyLike);
  if ("carrier" in out) out.carrier = upperParty(out.carrier as PartyLike);
  // The top-level fields are shipment 1's mirror (#112, `legacyMirrorFields`)
  // — same treatment as before #112 ever existed.
  if ("loadLocation" in out && typeof out.loadLocation === "object") {
    out.loadLocation = upperLocation(out.loadLocation as LocationLike);
  }
  if ("unloadLocation" in out && typeof out.unloadLocation === "object") {
    out.unloadLocation = upperLocation(out.unloadLocation as LocationLike);
  }
  if ("goods" in out) out.goods = up(out.goods);
  if ("reference" in out) out.reference = up(out.reference);
  if ("notes" in out) out.notes = up(out.notes);
  // #112: every shipment beyond the first lives ONLY in `shipments[]` — it
  // never appears in the flat mirror above, so it needs its own pass or it
  // would render inconsistently cased next to shipment 1 and every other
  // DeCA field.
  if (Array.isArray(out.shipments)) {
    out.shipments = (out.shipments as Record<string, unknown>[]).map(upperShipment);
  }
  return out as T;
}
