import { describe, expect, it } from "vitest";
import { locationSchema, formatLocationFull, formatLocationCityLine } from "@/lib/deca/location";

/**
 * #75 — the DeCA address must be built ONLY from the address fields that were
 * actually informed. A missing province leaves no gap, no stray "— " or ", ",
 * and nothing (no marital status, no personal field, no guessed region) is
 * ever substituted in its place.
 */

const full = {
  name: "Almacén Turia",
  address: "Av. del Puerto 120",
  postalCode: "46023",
  city: "Valencia",
  province: "Valencia",
  country: "España",
};

describe("formatLocationCityLine (#75)", () => {
  it("joins postal code · city — province, country when all present", () => {
    expect(formatLocationCityLine(full)).toBe("46023 Valencia — Valencia, España");
  });

  it("drops the province cleanly when it is absent — no dangling separator", () => {
    const line = formatLocationCityLine({ ...full, province: undefined });
    expect(line).toBe("46023 Valencia — España");
    expect(line).not.toContain("— ,");
    expect(line).not.toMatch(/—\s*$/);
  });

  it("a foreign address with no province and no postal code still reads cleanly", () => {
    expect(
      formatLocationCityLine({
        name: "Dépôt Lyon Est",
        address: "12 rue de la Logistique",
        postalCode: "",
        city: "Vaulx-en-Velin",
        country: "Francia",
      }),
    ).toBe("Vaulx-en-Velin — Francia");
  });

  it("never emits the El Puig / 'Soltero' shape: only informed fields appear", () => {
    // The schema drops a blank province before it ever reaches the renderer.
    const parsed = locationSchema.parse({
      name: "Nave El Puig",
      address: "Camí del Mar 3",
      postalCode: "46540",
      city: "El Puig",
      province: "   ",
      country: "España",
    });
    expect(parsed.province).toBeUndefined();
    expect(formatLocationCityLine(parsed)).toBe("46540 El Puig — España");
  });
});

describe("formatLocationFull (#75)", () => {
  it("omits an absent province without leaving a comma gap", () => {
    expect(formatLocationFull({ ...full, province: undefined })).toBe(
      "Almacén Turia, Av. del Puerto 120, 46023 Valencia, España",
    );
  });
});
