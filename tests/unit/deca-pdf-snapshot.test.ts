import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { renderDecaPdf } from "@/lib/pdf/render";
import { DECA_ROLES } from "@/lib/deca/roles";
import type { DecaPayload } from "@/lib/deca/schema";

/**
 * #66 — a structural snapshot of the generated DeCA. Renders with real,
 * ANONYMISED data and checks the CMR-style numbered grid, every mandatory
 * legal field, the correct party terminology (#61), and the postal code /
 * town in the load & unload cells (#59). Not a pixel snapshot — @react-pdf
 * has no image backend here — but it locks the document's content and
 * structure so a redesign can't silently drop a field.
 */

const payload: DecaPayload = {
  shipper: {
    name: "Transportes Ejemplo SL",
    nif: "B12345674",
    address: "Av. del Puerto 120, 46023 Valencia",
  },
  carrier: {
    name: "Logística del Turia SA",
    nif: "A96789011",
    address: "Pol. Fuente del Jarro, calle 5, 46988 Paterna",
  },
  loadLocation: {
    name: "Almacén Turia",
    address: "Av. del Puerto 120",
    postalCode: "46023",
    city: "Valencia",
    province: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: "Plataforma Norte",
    address: "Calle Alcalá 200",
    postalCode: "28028",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
  trailerPlate: "R-4471",
};

async function text() {
  const buf = await renderDecaPdf({
    data: payload,
    publicUrl: "https://decaprofesional.es/d/A4F2C9E1",
    reference: "DECA-A4F2C9E1",
    versionNo: 1,
    createdAt: new Date("2026-10-06T08:41:00Z"),
  });
  expect(buf.byteLength).toBeLessThan(5 * 1024 * 1024); // R-4
  expect(buf.subarray(0, 5).toString()).toBe("%PDF-"); // R-3, a real PDF
  const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const c = await (await doc.getPage(i)).getTextContent();
    out += " " + c.items.map((it: { str?: string }) => it.str ?? "").join(" ");
  }
  return out.replace(/\s+/g, " ");
}

describe("#66 — generated DeCA structural snapshot", () => {
  it("is a DeCA, not a CMR, with the correct party terminology", async () => {
    const t = (await text()).toLowerCase();
    expect(t).toMatch(/documento (electrónico|administrativo) de control|deca/);
    expect(t).not.toMatch(/\bcmr\b/);
    expect(t).toContain(DECA_ROLES.shipper.title.toLowerCase()); // "cargador contractual"
    expect(t).toContain(DECA_ROLES.carrier.title.toLowerCase()); // "transportista efectivo"
  });

  it("carries every mandatory value", async () => {
    const t = await text();
    for (const v of [
      "Transportes Ejemplo SL",
      "B12345674",
      "Logística del Turia SA",
      "A96789011",
      "Almacén Turia",
      "Plataforma Norte",
      "Palés de cerámica",
      "12000 kg",
      "1234 BCD",
      "R-4471",
      "DECA-A4F2C9E1",
      "decaprofesional.es/d/A4F2C9E1",
    ]) {
      expect(t, v).toContain(v);
    }
  });

  it("shows the postal code and town in both location cells (#59)", async () => {
    const t = await text();
    expect(t).toContain("46023");
    expect(t).toContain("28028");
    expect(t).toMatch(/46023.*Valencia/);
    expect(t).toMatch(/28028.*Madrid/);
  });

  it("numbers the cells CMR-style (1–8)", async () => {
    const t = await text();
    // the eight cell numbers appear as standalone tokens
    for (const n of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
      expect(t).toMatch(new RegExp(`(^| )${n}( |$)`));
    }
  });
});
