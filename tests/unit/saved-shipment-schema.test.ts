import { describe, expect, it } from "vitest";
import { savedShipmentSchema } from "@/lib/data/saved-schema";

describe("savedShipmentSchema (#113 — ruta/envío habitual)", () => {
  const base = { loadLocationId: "loc_load1", unloadLocationId: "loc_unload1" };

  it("accepts the minimal shape (only the two location ids)", () => {
    const d = savedShipmentSchema.parse(base);
    expect(d.loadLocationId).toBe("loc_load1");
    expect(d.unloadLocationId).toBe("loc_unload1");
    expect(d.name).toBe("");
    expect(d.goods).toBe("");
  });

  it("uppercases goods and recipient (#86 p3), leaves weight verbatim", () => {
    const d = savedShipmentSchema.parse({
      ...base,
      goods: "palets de cerámica",
      weight: "12.500 kg",
      recipient: "almacén norte",
    });
    expect(d.goods).toBe("PALETS DE CERÁMICA");
    expect(d.recipient).toBe("ALMACÉN NORTE");
    expect(d.weight).toBe("12.500 kg");
  });

  it("rejects a missing loadLocationId", () => {
    const r = savedShipmentSchema.safeParse({ unloadLocationId: "loc_unload1" });
    expect(r.success).toBe(false);
  });

  it("rejects a missing unloadLocationId", () => {
    const r = savedShipmentSchema.safeParse({ loadLocationId: "loc_load1" });
    expect(r.success).toBe(false);
  });

  it("keeps an optional name verbatim (trimmed, not uppercased — a free label)", () => {
    const d = savedShipmentSchema.parse({ ...base, name: "  Reparto Madrid  " });
    expect(d.name).toBe("Reparto Madrid");
  });
});
