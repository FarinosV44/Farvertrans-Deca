import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { diffVersions } from "@/lib/deca/detail";

const base = {
  shipper: { name: "Cargas SL", nif: "B1", address: "Calle 1" },
  carrier: { name: "Trans SL", nif: "B2", address: "Calle 2" },
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
  trailerPlate: "",
  reference: "",
};

describe("diffVersions — 'Qué ha cambiado' (PRODUCT #36 §6)", () => {
  it("returns nothing when the two payloads are identical", () => {
    expect(diffVersions(base, { ...base })).toEqual([]);
  });

  it("reports only the changed fields, with human labels and both values", () => {
    const changed = diffVersions(base, { ...base, destination: "Barcelona", weight: "13000 kg" });
    expect(changed).toEqual([
      { label: "Destino", from: "Madrid", to: "Barcelona" },
      { label: "Peso o medida", from: "12000 kg", to: "13000 kg" },
    ]);
  });

  it("renders an empty value as a dash", () => {
    const changed = diffVersions(base, { ...base, reference: "REF-9" });
    expect(changed).toEqual([{ label: "Referencia", from: "—", to: "REF-9" }]);
  });

  it("descends into nested party fields", () => {
    const changed = diffVersions(base, {
      ...base,
      carrier: { ...base.carrier, name: "Otro Transportista SL" },
    });
    expect(changed).toEqual([
      { label: "Transportista — nombre", from: "Trans SL", to: "Otro Transportista SL" },
    ]);
  });
});
