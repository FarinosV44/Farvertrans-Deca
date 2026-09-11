import { describe, expect, it } from "vitest";
import {
  decaPayloadSchema,
  resolveShipment,
  resolveShipments,
  legacyMirrorFields,
  sumWeights,
  type DecaPayload,
} from "@/lib/deca/schema";

/**
 * #112 — multiple shipments ("envíos") per DeCA. Pure-logic tests for the
 * resolve/mirror/sum helpers and the schema's dual (legacy flat / new
 * `shipments` array) input acceptance. `lib/pdf/deca-document.tsx`'s own
 * rendering is covered separately in `deca-pdf-snapshot.test.ts`.
 */

const base = {
  shipper: { name: "Cargas SL", nif: "B12345678", address: "Calle Mayor 1, Valencia" },
  carrier: {
    name: "Transportes Pérez SL",
    nif: "B98765432",
    address: "Pol. Ind. Fuente del Jarro, calle 5, Paterna",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  tractorPlate: "1234 BCD",
  trailerPlate: "",
};

const shipmentA = {
  loadLocation: {
    name: "Almacén Turia",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: "Plataforma Norte",
    address: "Calle Alcalá 200",
    postalCode: "28028",
    city: "Madrid",
    country: "España",
  },
  goods: "Palés de cerámica",
  weight: "12000 kg",
};

const shipmentB = {
  loadLocation: {
    name: "Almacén Castellón",
    address: "Av. del Mar 5",
    postalCode: "12003",
    city: "Castellón de la Plana",
    country: "España",
  },
  unloadLocation: shipmentA.unloadLocation,
  goods: "Azulejos",
  weight: "8 t",
};

describe("decaPayloadSchema — legacy flat input still validates unchanged (#112 backward-compat)", () => {
  it("accepts the pre-#112 flat single-shipment body and normalizes it into shipments[0]", () => {
    const flat = { ...base, ...shipmentA };
    const r = decaPayloadSchema.safeParse(flat);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.shipments).toHaveLength(1);
    expect(r.data.shipments[0].loadLocation.name).toBe("Almacén Turia");
    expect(r.data.shipments[0].goods).toBe("Palés de cerámica");
    // DeCA-level fields are unchanged from the flat body.
    expect(r.data.tractorPlate).toBe("1234BCD");
  });

  it("rejects a missing mandatory shipment field exactly as the flat schema did", () => {
    const flat = { ...base, ...shipmentA, goods: "" };
    expect(decaPayloadSchema.safeParse(flat).success).toBe(false);
  });
});

describe("decaPayloadSchema — new shipments[] input", () => {
  const valid = { ...base, shipments: [shipmentA, shipmentB] };

  it("accepts 2 shipments sharing one shipper/carrier", () => {
    const r = decaPayloadSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.shipments).toHaveLength(2);
  });

  it("rejects an empty shipments array", () => {
    const r = decaPayloadSchema.safeParse({ ...base, shipments: [] });
    expect(r.success).toBe(false);
  });

  it("shipper/carrier cannot diverge per shipment BY CONSTRUCTION — there is no field to set it on", () => {
    // The type itself proves this: `shipmentSchema` has no shipper/carrier
    // key, so there is no way to even express "shipment 2 has a different
    // carrier" in a payload that passes the schema at all.
    const parsed = decaPayloadSchema.parse(valid) as DecaPayload;
    expect(Object.keys(parsed.shipments[0])).not.toContain("shipper");
    expect(Object.keys(parsed.shipments[0])).not.toContain("carrier");
  });

  it("a shipment's override wins over the DeCA-level default; an unset field inherits it", () => {
    const r = decaPayloadSchema.parse({
      ...base,
      shipments: [
        shipmentA,
        {
          ...shipmentB,
          loadDate: "2026-10-07",
          unloadDate: "2026-10-07", // both overridden, so date-order still holds
          tractorPlate: "9999 ZZZ",
        },
      ],
    }) as DecaPayload;
    const resolved = resolveShipments(r);
    expect(resolved[0].loadDate).toBe("2026-10-06"); // inherited default
    expect(resolved[0].tractorPlate).toBe("1234BCD"); // inherited default
    expect(resolved[1].loadDate).toBe("2026-10-07"); // overridden
    expect(resolved[1].tractorPlate).toBe("9999ZZZ"); // overridden
  });

  it("rejects a shipment whose OWN resolved unload date precedes its load date", () => {
    // Shipment 2 overrides only unloadDate to something before the DeCA-level
    // loadDate default — must fail even though the DeCA-level dates alone
    // are fine.
    const r = decaPayloadSchema.safeParse({
      ...base,
      shipments: [shipmentA, { ...shipmentB, unloadDate: "2026-10-01" }],
    });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.issues.some((i) => i.path.join(".") === "shipments.1.unloadDate")).toBe(true);
  });
});

describe("resolveShipment / resolveShipments", () => {
  const deca = decaPayloadSchema.parse({
    ...base,
    shipments: [shipmentA, shipmentB],
  }) as DecaPayload;

  it("always uses the shipment's own core fields, never a default", () => {
    const resolved = resolveShipment(deca, deca.shipments[1]);
    expect(resolved.goods).toBe("Azulejos");
    expect(resolved.weight).toBe("8 t");
    expect(resolved.loadLocation.city).toBe("Castellón de la Plana");
  });

  it("recipient defaults to an empty string when absent, never undefined leaking into the PDF", () => {
    const resolved = resolveShipment(deca, deca.shipments[0]);
    expect(resolved.recipient).toBe("");
  });
});

describe("legacyMirrorFields — backward-compat write for existing dataJson readers", () => {
  it("mirrors shipments[0]'s resolved values at the top level, in the pre-#112 flat shape", () => {
    const deca = decaPayloadSchema.parse({
      ...base,
      shipments: [shipmentA, shipmentB],
    }) as DecaPayload;
    const mirror = legacyMirrorFields(deca);
    expect(mirror.goods).toBe("Palés de cerámica");
    expect(mirror.weight).toBe("12000 kg");
    expect((mirror.loadLocation as { name: string }).name).toBe("Almacén Turia");
    // Shipment 2's data never leaks into the mirror — it's shipment 1 only.
    expect(mirror.goods).not.toBe("Azulejos");
  });
});

describe("sumWeights", () => {
  it("sums numeric weights across units into kg, es-ES formatted", () => {
    const deca = decaPayloadSchema.parse({
      ...base,
      shipments: [shipmentA, shipmentB],
    }) as DecaPayload;
    const totals = sumWeights(resolveShipments(deca));
    expect(totals.allParsed).toBe(true);
    // 12000 kg + 8 t (8000 kg) = 20000 kg
    expect(totals.total).toBe("20.000 kg");
  });

  it("never fabricates a total when any shipment has a non-numeric measure", () => {
    const deca = decaPayloadSchema.parse({
      ...base,
      shipments: [shipmentA, { ...shipmentB, weight: "una plataforma completa" }],
    }) as DecaPayload;
    const totals = sumWeights(resolveShipments(deca));
    expect(totals.allParsed).toBe(false);
    expect(totals.total).toBe("");
  });

  it("a single shipment sums to exactly its own weight", () => {
    const deca = decaPayloadSchema.parse({ ...base, ...shipmentA }) as DecaPayload;
    const totals = sumWeights(resolveShipments(deca));
    expect(totals.allParsed).toBe(true);
    expect(totals.total).toBe("12.000 kg");
  });
});
