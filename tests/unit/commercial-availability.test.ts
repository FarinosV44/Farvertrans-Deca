import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { buildAvailabilityPayload } from "@/lib/commercial/availability";
import { sharedFieldKeys, type CommercialTreatmentState } from "@/lib/consent";

const deca = {
  carrier: { name: "Transportes Pérez SL" },
  unloadLocation: { city: "Madrid" },
  unloadDate: "2026-10-06",
  // things that must NEVER leak:
  shipper: { name: "Cargas del Turia SL", nif: "B96789011" },
  loadLocation: { city: "Valencia", address: "Av. del Puerto 120" },
  goods: "Palés de cerámica",
  weight: "12500 kg",
  tractorPlate: "1234 BCD",
} as Parameters<typeof buildAvailabilityPayload>[0];

const treatment = (over: Partial<CommercialTreatmentState> = {}): CommercialTreatmentState => ({
  mode: "all",
  channel: "both",
  contactEmail: "flota@perez.example",
  contactPhone: "600111222",
  version: "2026-09-15",
  grantedAt: new Date(),
  revokedAt: null,
  updatedAt: new Date(),
  ...over,
});

const ALLOWED = new Set([
  "carrierName",
  "destination",
  "availabilityDate",
  "channel",
  "contactEmail",
  "contactPhone",
]);

describe("buildAvailabilityPayload — payload contains ONLY authorised fields (#84)", () => {
  it("shares exactly carrier / destination / date / channel + the selected contact, nothing else", () => {
    const p = buildAvailabilityPayload(deca, treatment(), { enabled: true });
    expect(p).not.toBeNull();
    for (const k of Object.keys(p!)) expect(ALLOWED.has(k), `unexpected key: ${k}`).toBe(true);
    expect(p!.carrierName).toBe("Transportes Pérez SL");
    expect(p!.destination).toBe("Madrid");
    expect(p!.availabilityDate).toBe("2026-10-06");
    // explicitly assert the excluded data never appears anywhere in the payload
    const serialised = JSON.stringify(p);
    for (const forbidden of [
      "Cargas del Turia",
      "B96789011",
      "Av. del Puerto",
      "Valencia",
      "Palés",
      "12500",
      "1234 BCD",
    ]) {
      expect(serialised).not.toContain(forbidden);
    }
  });

  it("channel 'email' carries the email and NOT the phone", () => {
    const p = buildAvailabilityPayload(deca, treatment({ channel: "email" }), { enabled: true });
    expect(p!.contactEmail).toBe("flota@perez.example");
    expect(p!.contactPhone).toBeUndefined();
  });

  it("channel 'phone' carries the phone and NOT the email", () => {
    const p = buildAvailabilityPayload(deca, treatment({ channel: "phone" }), { enabled: true });
    expect(p!.contactPhone).toBe("600111222");
    expect(p!.contactEmail).toBeUndefined();
  });

  it("returns null when the global mode is 'none'", () => {
    expect(
      buildAvailabilityPayload(deca, treatment({ mode: "none" }), { enabled: true }),
    ).toBeNull();
  });

  it("mode 'per_deca' defaults OFF — null unless the porte control is enabled", () => {
    expect(buildAvailabilityPayload(deca, treatment({ mode: "per_deca" }), undefined)).toBeNull();
    expect(
      buildAvailabilityPayload(deca, treatment({ mode: "per_deca" }), { enabled: false }),
    ).toBeNull();
    expect(
      buildAvailabilityPayload(deca, treatment({ mode: "per_deca" }), { enabled: true }),
    ).not.toBeNull();
  });

  it("mode 'all' defaults ON — a payload is produced with no override", () => {
    expect(buildAvailabilityPayload(deca, treatment({ mode: "all" }), undefined)).not.toBeNull();
    // ...but an explicit per-porte opt-out wins
    expect(
      buildAvailabilityPayload(deca, treatment({ mode: "all" }), { enabled: false }),
    ).toBeNull();
  });

  it("per-DeCA overrides for destination / date / channel take precedence", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      destination: "Zona Levante",
      availabilityDate: "2026-10-08",
      channel: "email",
    });
    expect(p!.destination).toBe("Zona Levante");
    expect(p!.availabilityDate).toBe("2026-10-08");
    expect(p!.channel).toBe("email");
    expect(p!.contactPhone).toBeUndefined();
  });

  it("with no channel set anywhere, falls back to 'email'", () => {
    const p = buildAvailabilityPayload(deca, treatment({ channel: null }), { enabled: true });
    expect(p?.channel).toBe("email");
    expect(p?.contactEmail).toBe("flota@perez.example");
    expect(p?.contactPhone).toBeUndefined();
  });

  it("returns null when destination or date cannot be resolved", () => {
    expect(
      buildAvailabilityPayload(
        { ...deca, unloadLocation: { city: "" }, unloadDate: "2026-10-06" },
        treatment(),
        { enabled: true },
      ),
    ).toBeNull();
    expect(
      buildAvailabilityPayload({ ...deca, unloadDate: "" }, treatment(), {
        enabled: true,
        destination: "Madrid",
      }),
    ).toBeNull();
  });
});

describe("sharedFieldKeys", () => {
  it("lists only the base fields plus the channel-appropriate contact", () => {
    expect(sharedFieldKeys("email")).toEqual([
      "carrierName",
      "destination",
      "availabilityDate",
      "contactEmail",
    ]);
    expect(sharedFieldKeys("phone")).toEqual([
      "carrierName",
      "destination",
      "availabilityDate",
      "contactPhone",
    ]);
    expect(sharedFieldKeys("both")).toContain("contactEmail");
    expect(sharedFieldKeys("both")).toContain("contactPhone");
    expect(sharedFieldKeys(null)).toEqual(["carrierName", "destination", "availabilityDate"]);
  });
});
