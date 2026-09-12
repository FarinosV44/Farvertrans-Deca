import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  buildAvailabilityPayload,
  findCompatibleAvailabilities,
  type AvailabilityCandidate,
} from "@/lib/commercial/availability";
import { sharedFieldKeys, type CommercialTreatmentState } from "@/lib/consent";
import { commercialChannelLabelEs } from "@/lib/commercial/types";

const deca = {
  carrier: { name: "Transportes Pérez SL" },
  shipments: [{ unloadLocation: { city: "Madrid" }, unloadDate: "2026-10-06" }],
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
  "preferredDestination",
  "capacityMode",
  "linearMeters",
  "maxWeightKg",
  "vehicleType",
]);

describe("buildAvailabilityPayload — payload contains ONLY authorised fields (#84/#119)", () => {
  it("shares exactly carrier / destination / date / channel + the selected contact, nothing else", () => {
    const p = buildAvailabilityPayload(deca, treatment(), { enabled: true });
    expect(p).not.toBeNull();
    for (const k of Object.keys(p!)) expect(ALLOWED.has(k), `unexpected key: ${k}`).toBe(true);
    expect(p!.carrierName).toBe("Transportes Pérez SL");
    expect(p!.destination).toBe("Madrid");
    expect(p!.availabilityDate).toBe("2026-10-06");
    expect(p!.capacityMode).toBe("full");
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
        { ...deca, shipments: [{ unloadLocation: { city: "" }, unloadDate: "2026-10-06" }] },
        treatment(),
        { enabled: true },
      ),
    ).toBeNull();
    expect(
      buildAvailabilityPayload(
        { ...deca, shipments: [{ unloadLocation: { city: "Madrid" }, unloadDate: "" }] },
        treatment(),
        { enabled: true, destination: "Madrid" },
      ),
    ).toBeNull();
  });

  // #119
  it("picks the shipment named by finalShipmentIndex for a multi-envío DeCA, never shipment 0 blindly", () => {
    const multi = {
      ...deca,
      shipments: [
        { unloadLocation: { city: "Madrid" }, unloadDate: "2026-10-06" },
        { unloadLocation: { city: "Toledo" }, unloadDate: "2026-10-07" },
      ],
    };
    const p = buildAvailabilityPayload(multi, treatment(), {
      enabled: true,
      finalShipmentIndex: 1,
    });
    expect(p!.destination).toBe("Toledo");
    expect(p!.availabilityDate).toBe("2026-10-07");
  });

  it("an out-of-range finalShipmentIndex falls back to shipment 0, never throws", () => {
    const p = buildAvailabilityPayload(deca, treatment(), { enabled: true, finalShipmentIndex: 9 });
    expect(p!.destination).toBe("Madrid");
  });

  it("preferredDestination is optional and never invents one", () => {
    const p1 = buildAvailabilityPayload(deca, treatment(), { enabled: true });
    expect(p1!.preferredDestination).toBeUndefined();
    const p2 = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      preferredDestination: "Valencia",
    });
    expect(p2!.preferredDestination).toBe("Valencia");
  });

  it("'Grupaje' (partial) REQUIRES positive linearMeters and maxWeightKg, else the payload is rejected", () => {
    expect(
      buildAvailabilityPayload(deca, treatment(), { enabled: true, capacityMode: "partial" }),
    ).toBeNull();
    expect(
      buildAvailabilityPayload(deca, treatment(), {
        enabled: true,
        capacityMode: "partial",
        linearMeters: 4,
        maxWeightKg: 0,
      }),
    ).toBeNull();
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      capacityMode: "partial",
      linearMeters: 4,
      maxWeightKg: 8000,
    });
    expect(p!.capacityMode).toBe("partial");
    expect(p!.linearMeters).toBe(4);
    expect(p!.maxWeightKg).toBe(8000);
  });

  it("'Camión completo' (full, the default) never carries linearMeters/maxWeightKg even if stray values are passed", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      capacityMode: "full",
      linearMeters: 4,
      maxWeightKg: 8000,
    });
    expect(p!.capacityMode).toBe("full");
    expect(p!.linearMeters).toBeUndefined();
    expect(p!.maxWeightKg).toBeUndefined();
  });

  it("vehicleType only accepts the two known values, silently drops anything else", () => {
    const p1 = buildAvailabilityPayload(deca, treatment(), { enabled: true, vehicleType: "lona" });
    expect(p1!.vehicleType).toBe("lona");
    const p2 = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      // @ts-expect-error — deliberately invalid, must be dropped not thrown
      vehicleType: "granel",
    });
    expect(p2!.vehicleType).toBeUndefined();
  });
});

describe("sharedFieldKeys", () => {
  it("lists the base fields + the #119 voluntary fields + the channel-appropriate contact", () => {
    const base = [
      "carrierName",
      "destination",
      "availabilityDate",
      "preferredDestination",
      "capacityMode",
      "linearMeters",
      "maxWeightKg",
      "vehicleType",
    ];
    expect(sharedFieldKeys("email")).toEqual([...base, "contactEmail"]);
    expect(sharedFieldKeys("phone")).toEqual([...base, "contactPhone"]);
    expect(sharedFieldKeys("both")).toContain("contactEmail");
    expect(sharedFieldKeys("both")).toContain("contactPhone");
    expect(sharedFieldKeys(null)).toEqual(base);
  });
});

describe("commercialChannelLabelEs (#85 — WhatsApp replaces the 'Teléfono' label)", () => {
  it("shows the phone channel as WhatsApp and never as 'Teléfono'", () => {
    expect(commercialChannelLabelEs("phone")).toBe("WhatsApp");
    expect(commercialChannelLabelEs("both")).toBe("Correo y WhatsApp");
    expect(commercialChannelLabelEs("email")).toBe("Correo electrónico");
    expect(commercialChannelLabelEs(null)).toBe("—");
    expect(["phone", "both", "email"].map(commercialChannelLabelEs).join(" ")).not.toMatch(
      /tel[eé]fono/i,
    );
  });
});

// #119 — the matching proposal
describe("findCompatibleAvailabilities — v1 matching (#119)", () => {
  const candidate = (over: Partial<AvailabilityCandidate> = {}): AvailabilityCandidate => ({
    zone: "Madrid",
    preferredDestination: null,
    availabilityDate: new Date("2026-10-06"),
    vehicleType: null,
    capacityMode: "full",
    linearMeters: null,
    maxWeightKg: null,
    ...over,
  });

  it("matches when my zona equals another's zona (same-city fallback)", () => {
    const mine = candidate({ zone: "Madrid" });
    const other = candidate({ zone: "Madrid" });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
  });

  it("matches my zona against their destino preferente, and vice versa", () => {
    const mine = candidate({ zone: "Madrid", preferredDestination: "Valencia" });
    const other = candidate({ zone: "Valencia" });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);

    const mine2 = candidate({ zone: "Sevilla" });
    const other2 = candidate({ zone: "Bilbao", preferredDestination: "Sevilla" });
    expect(findCompatibleAvailabilities(mine2, [other2])).toEqual([other2]);
  });

  it("excludes a candidate outside the date window", () => {
    const mine = candidate({ availabilityDate: new Date("2026-10-06") });
    const far = candidate({ availabilityDate: new Date("2026-10-20") });
    expect(findCompatibleAvailabilities(mine, [far])).toEqual([]);
  });

  it("excludes a candidate with an incompatible vehicle type", () => {
    const mine = candidate({ vehicleType: "lona" });
    const other = candidate({ vehicleType: "frigorifico" });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([]);
  });

  it("an unspecified vehicle type is compatible with any type", () => {
    const mine = candidate({ vehicleType: "lona" });
    const other = candidate({ vehicleType: null });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
  });

  it("'full' capacity is always compatible either way", () => {
    const mine = candidate({ capacityMode: "full" });
    const other = candidate({ capacityMode: "partial", linearMeters: 4, maxWeightKg: 8000 });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
  });

  it("'partial' vs 'partial' requires both sides to have declared real capacity", () => {
    const mine = candidate({ capacityMode: "partial", linearMeters: 4, maxWeightKg: 8000 });
    const missingData = candidate({ capacityMode: "partial", linearMeters: 0, maxWeightKg: 0 });
    expect(findCompatibleAvailabilities(mine, [missingData])).toEqual([]);
    const complete = candidate({ capacityMode: "partial", linearMeters: 2, maxWeightKg: 3000 });
    expect(findCompatibleAvailabilities(mine, [complete])).toEqual([complete]);
  });

  it("never returns anything beyond the anonymised candidate shape — no identity fields exist to leak", () => {
    const mine = candidate({ zone: "Madrid" });
    const other = candidate({ zone: "Madrid" });
    const [match] = findCompatibleAvailabilities(mine, [other]);
    expect(Object.keys(match).sort()).toEqual(
      [
        "zone",
        "preferredDestination",
        "availabilityDate",
        "vehicleType",
        "capacityMode",
        "linearMeters",
        "maxWeightKg",
      ].sort(),
    );
  });
});
