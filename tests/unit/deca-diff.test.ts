import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { diffVersions } from "@/lib/deca/detail";

const base = {
  shipper: { name: "Cargas SL", nif: "B1", address: "Calle 1" },
  carrier: { name: "Trans SL", nif: "B2", address: "Calle 2" },
  loadLocation: { name: "Almacén Turia", address: "Av. Puerto 120", city: "Valencia" },
  unloadLocation: { name: "Plataforma Norte", address: "Calle Alcalá 200", city: "Madrid" },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
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
    const changed = diffVersions(base, {
      ...base,
      unloadLocation: { ...base.unloadLocation, name: "Plataforma Este" },
      weight: "13000 kg",
    });
    expect(changed).toEqual([
      { label: "Lugar de descarga — nombre", from: "Plataforma Norte", to: "Plataforma Este" },
      { label: "Peso o medida", from: "12000 kg", to: "13000 kg" },
    ]);
  });

  // #134 — notes ("Información especial") is a real, editable DeCA-level
  // field (same override pattern as tractorPlate/trailerPlate) and IS
  // written into dataJson, but was never covered by the diff at all.
  it("#134: reports a change to the DeCA-level notes field", () => {
    const changed = diffVersions(
      { ...base, notes: "" },
      { ...base, notes: "Entrega solo en horario de mañana" },
    );
    expect(changed).toEqual([
      { label: "Información especial", from: "—", to: "Entrega solo en horario de mañana" },
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
      { label: "Transportista efectivo — nombre", from: "Trans SL", to: "Otro Transportista SL" },
    ]);
  });

  // #112 — a correction that adds/removes/edits a shipment beyond the first
  // must be traceable in the diff, per the Resolución's own "modificación
  // trazable" requirement (apdo. Quinto), same as every other field.
  describe("#112 — shipment-aware diff", () => {
    const shipment2 = {
      loadLocation: { name: "Almacén Castellón", city: "Castellón" },
      unloadLocation: { name: "Plataforma Norte", city: "Madrid" },
      goods: "Azulejos",
      weight: "8000 kg",
    };

    it("reports an added shipment 2, and returns nothing for two identical multi-shipment payloads", () => {
      const from = { ...base, shipments: [base] };
      const to = { ...base, shipments: [base, shipment2] };
      const changed = diffVersions(from, to);
      expect(changed).toEqual([
        {
          label: "Envío 2",
          from: "— (no existía)",
          to: "Añadido: Almacén Castellón → Plataforma Norte",
        },
      ]);
      expect(diffVersions(to, { ...to })).toEqual([]);
    });

    it("reports a removed shipment 2", () => {
      const from = { ...base, shipments: [base, shipment2] };
      const to = { ...base, shipments: [base] };
      const changed = diffVersions(from, to);
      expect(changed).toEqual([
        { label: "Envío 2", from: "Eliminado: Almacén Castellón → Plataforma Norte", to: "—" },
      ]);
    });

    it("diffs a changed field WITHIN shipment 2, never confusing it with shipment 1's own fields", () => {
      const from = { ...base, shipments: [base, shipment2] };
      const to = { ...base, shipments: [base, { ...shipment2, weight: "9000 kg" }] };
      const changed = diffVersions(from, to);
      expect(changed).toEqual([
        { label: "Envío 2 — Peso o medida", from: "8000 kg", to: "9000 kg" },
      ]);
    });

    it("diffs shipment 1's recipient (the one field not covered by the flat mirror)", () => {
      const from = { ...base, shipments: [{ ...base, recipient: "" }] };
      const to = { ...base, shipments: [{ ...base, recipient: "Logística Madrid SL" }] };
      expect(diffVersions(from, to)).toEqual([
        { label: "Destinatario (envío 1)", from: "—", to: "Logística Madrid SL" },
      ]);
    });

    it("#134: diffs a per-shipment notes override on shipment 2", () => {
      const from = { ...base, shipments: [base, shipment2] };
      const to = {
        ...base,
        shipments: [base, { ...shipment2, notes: "Aviso 1h antes de llegar" }],
      };
      expect(diffVersions(from, to)).toEqual([
        {
          label: "Envío 2 — Información especial",
          from: "—",
          to: "Aviso 1h antes de llegar",
        },
      ]);
    });

    it("diffs a route change within shipment 2 as its own row", () => {
      const from = { ...base, shipments: [base, shipment2] };
      const to = {
        ...base,
        shipments: [
          base,
          { ...shipment2, unloadLocation: { name: "Plataforma Este", city: "Madrid" } },
        ],
      };
      expect(diffVersions(from, to)).toEqual([
        {
          label: "Envío 2 — Ruta",
          from: "Almacén Castellón → Plataforma Norte",
          to: "Almacén Castellón → Plataforma Este",
        },
      ]);
    });
  });
});
