import { describe, expect, it } from "vitest";
import { DECA_ROLES } from "@/lib/deca/roles";
import { es } from "@/lib/i18n/dictionaries/es";

describe("DECA_ROLES (#61 — unified DeCA-party terminology)", () => {
  it("names the contractual and effective parties per the 2026 resolution", () => {
    expect(DECA_ROLES.shipper.title).toBe("Cargador contractual");
    expect(DECA_ROLES.carrier.title).toBe("Transportista efectivo");
  });

  it("keeps every case form derivable from the same wording", () => {
    for (const role of [DECA_ROLES.shipper, DECA_ROLES.carrier]) {
      expect(role.upper).toBe(role.title.toUpperCase());
      expect(role.inline).toBe(role.title.toLowerCase());
      // the bare short form is a prefix of the full inline form
      expect(role.inline.startsWith(role.short)).toBe(true);
    }
  });

  it("is the single source of truth — the es dictionary defers to it", () => {
    expect(es.legal.roles.shipper).toBe(DECA_ROLES.shipper.title);
    expect(es.legal.roles.carrier).toBe(DECA_ROLES.carrier.title);
  });
});
