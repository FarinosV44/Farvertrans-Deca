import { describe, expect, it } from "vitest";
import { templatePayloadSchema } from "@/lib/data/template-schema";

/**
 * #113 §5 — a template can carry `shipments` beyond the first, so a whole
 * recurring multi-envío lane ("REPARTO MADRID") stays owned by Plantillas
 * rather than a second concept inside Datos habituales. `shipments` reuses
 * the same `shipmentSchema` #112 validates a real DeCA's extra envíos with.
 */
describe("templatePayloadSchema — shipments (#113 §5)", () => {
  const validShipment = {
    loadLocation: {
      name: "Fábrica Castellón",
      address: "Polígono Industrial 1",
      postalCode: "12004",
      city: "Castellón",
      country: "España",
    },
    unloadLocation: {
      name: "Almacén Madrid",
      address: "Calle Mercancías 5",
      postalCode: "28001",
      city: "Madrid",
      country: "España",
    },
    goods: "Palets de cerámica",
    weight: "12 t",
    tractorPlate: "1234ABC",
  };

  it("stays valid without shipments (legacy single-shipment template — no regression)", () => {
    const r = templatePayloadSchema.safeParse({ name: "Valencia → Madrid" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.shipments).toBeUndefined();
  });

  it("accepts a template with shipments beyond the first", () => {
    const r = templatePayloadSchema.safeParse({
      name: "Reparto Madrid",
      shipments: [validShipment],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.shipments).toHaveLength(1);
  });

  it("rejects a shipment missing a required field (goods too short)", () => {
    const r = templatePayloadSchema.safeParse({
      name: "Reparto Madrid",
      shipments: [{ ...validShipment, goods: "X" }],
    });
    expect(r.success).toBe(false);
  });

  it("accepts an empty shipments array", () => {
    const r = templatePayloadSchema.safeParse({ name: "Solo", shipments: [] });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.shipments).toEqual([]);
  });
});
