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
  "capacityMode",
  "linearMeters",
  "maxWeightKg",
  "vehicleType",
  // 2026 correction to #119
  "vehicleTypeOther",
  "availabilityPostalCode",
  "preferredDestinationPostalCode",
  // ACLARACIÓN FINAL — replaces the removed free-text preferredDestination
  "preferredDestinationCountry",
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

  it("per-DeCA overrides for date / channel take precedence (destination is always derived — ACLARACIÓN FINAL)", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      availabilityDate: "2026-10-08",
      channel: "email",
    });
    expect(p!.destination).toBe("Madrid");
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
        { enabled: true },
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

  // ACLARACIÓN FINAL — "destino preferente" is CP + país only now (the
  // free-text field is gone entirely).
  it("preferredDestinationPostalCode/Country are optional and never invented", () => {
    const p1 = buildAvailabilityPayload(deca, treatment(), { enabled: true });
    expect(p1!.preferredDestinationPostalCode).toBeUndefined();
    expect(p1!.preferredDestinationCountry).toBeUndefined();
  });

  it("preferredDestinationCountry defaults to España whenever a postal code is set, even without an explicit country", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      preferredDestinationPostalCode: "46023",
    });
    expect(p!.preferredDestinationPostalCode).toBe("46023");
    expect(p!.preferredDestinationCountry).toBe("España");
  });

  it("an explicit preferredDestinationCountry is respected", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      preferredDestinationPostalCode: "75001",
      preferredDestinationCountry: "Francia",
    });
    expect(p!.preferredDestinationCountry).toBe("Francia");
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

  it("vehicleType only accepts the 6 known values, silently drops anything else", () => {
    for (const vt of [
      "lona",
      "frigorifico",
      "megatrailer",
      "jumbo",
      "frigolona",
      "otro",
    ] as const) {
      const p = buildAvailabilityPayload(deca, treatment(), { enabled: true, vehicleType: vt });
      expect(p!.vehicleType).toBe(vt);
    }
    const p2 = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      // @ts-expect-error — deliberately invalid, must be dropped not thrown
      vehicleType: "granel",
    });
    expect(p2!.vehicleType).toBeUndefined();
  });

  it("vehicleTypeOther is carried only when vehicleType is 'otro', never otherwise", () => {
    const p1 = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      vehicleType: "otro",
      vehicleTypeOther: "Portacontenedores",
    });
    expect(p1!.vehicleType).toBe("otro");
    expect(p1!.vehicleTypeOther).toBe("Portacontenedores");

    const p2 = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      vehicleType: "lona",
      vehicleTypeOther: "Portacontenedores", // irrelevant when vehicleType isn't "otro"
    });
    expect(p2!.vehicleTypeOther).toBeUndefined();
  });

  // 2026 correction to #119
  it("availabilityPostalCode is pre-filled from the final shipment's own unload postal code when not overridden", () => {
    const withPostal = {
      ...deca,
      shipments: [
        { unloadLocation: { city: "Madrid", postalCode: "28001" }, unloadDate: "2026-10-06" },
      ],
    };
    const p = buildAvailabilityPayload(withPostal, treatment(), { enabled: true });
    expect(p!.availabilityPostalCode).toBe("28001");
  });

  it("an explicit availabilityPostalCode override wins over the shipment's own", () => {
    const withPostal = {
      ...deca,
      shipments: [
        { unloadLocation: { city: "Madrid", postalCode: "28001" }, unloadDate: "2026-10-06" },
      ],
    };
    const p = buildAvailabilityPayload(withPostal, treatment(), {
      enabled: true,
      availabilityPostalCode: "46023",
    });
    expect(p!.availabilityPostalCode).toBe("46023");
  });

  it("a missing postal code on both the shipment and the override never blocks the payload", () => {
    const p = buildAvailabilityPayload(deca, treatment(), { enabled: true });
    expect(p).not.toBeNull();
    expect(p!.availabilityPostalCode).toBeUndefined();
  });

  it("preferredDestinationPostalCode is carried only when explicitly set — never invented", () => {
    const p = buildAvailabilityPayload(deca, treatment(), {
      enabled: true,
      preferredDestinationPostalCode: "46023",
    });
    expect(p!.preferredDestinationPostalCode).toBe("46023");
  });
});

describe("sharedFieldKeys", () => {
  it("lists the base fields + the #119 voluntary fields + the channel-appropriate contact", () => {
    const base = [
      "carrierName",
      "destination",
      "availabilityDate",
      "capacityMode",
      "linearMeters",
      "maxWeightKg",
      "vehicleType",
      "availabilityPostalCode",
      "preferredDestinationPostalCode",
      "preferredDestinationCountry",
      "vehicleTypeOther",
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
    zonePostalCode: null,
    preferredDestinationPostalCode: null,
    preferredDestinationCountry: null,
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

  // ACLARACIÓN FINAL — "destino preferente" is CP + país only; there is no
  // free-text fallback for this specific comparison any more.
  it("matches my destino preferente (CP) against their zona (CP), and vice versa", () => {
    const mine = candidate({ zone: "Madrid", zonePostalCode: "28001" });
    const other = candidate({ zone: "Valencia", zonePostalCode: "46001" });
    // no match yet — neither declares a preferred destination
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([]);

    const mineWithPreference = candidate({
      zone: "Madrid",
      zonePostalCode: "28001",
      preferredDestinationPostalCode: "46001",
      preferredDestinationCountry: "España",
    });
    expect(findCompatibleAvailabilities(mineWithPreference, [other])).toEqual([other]);

    const other2 = candidate({
      zone: "Bilbao",
      zonePostalCode: "48001",
      preferredDestinationPostalCode: "41001",
      preferredDestinationCountry: "España",
    });
    const mine2 = candidate({ zone: "Sevilla", zonePostalCode: "41001" });
    expect(findCompatibleAvailabilities(mine2, [other2])).toEqual([other2]);
  });

  it("a preferred destination in a country other than España is stored but never matched — no international postal geocoding exists", () => {
    const mine = candidate({
      zone: "Madrid",
      zonePostalCode: "28001",
      preferredDestinationPostalCode: "46001",
      preferredDestinationCountry: "Francia",
    });
    const other = candidate({ zone: "Valencia", zonePostalCode: "46001" });
    expect(findCompatibleAvailabilities(mine, [other])).toEqual([]);
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
        "zonePostalCode",
        "preferredDestinationPostalCode",
        "preferredDestinationCountry",
        "availabilityDate",
        "vehicleType",
        "capacityMode",
        "linearMeters",
        "maxWeightKg",
      ].sort(),
    );
  });

  // 2026 correction to #119 — postal code is now the canonical matching value
  describe("postal-code matching (2026 correction)", () => {
    it("matches on an exact postal code even when the free-text zone strings differ completely", () => {
      const mine = candidate({ zone: "Madrid centro", zonePostalCode: "28001" });
      const other = candidate({ zone: "Zona Norte", zonePostalCode: "28001" });
      expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
    });

    it("matches on the same 2-digit province prefix as a coarse proximity signal", () => {
      const mine = candidate({ zone: "Madrid", zonePostalCode: "28001" });
      const other = candidate({ zone: "Alcalá de Henares", zonePostalCode: "28802" });
      expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
    });

    it("does NOT match different provinces even if the free-text zone strings would have matched loosely", () => {
      const mine = candidate({ zone: "Valencia", zonePostalCode: "46001" });
      const other = candidate({ zone: "Valencia de Alcántara", zonePostalCode: "10500" });
      expect(findCompatibleAvailabilities(mine, [other])).toEqual([]);
    });

    it("falls back to free-text zone matching when either side lacks a postal code", () => {
      const mine = candidate({ zone: "Madrid", zonePostalCode: null });
      const other = candidate({ zone: "Madrid", zonePostalCode: "28001" });
      expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);
    });

    it("postal code also governs the zone↔preferredDestination cross-match, in both directions", () => {
      const mine = candidate({
        zone: "Valencia",
        zonePostalCode: "46001",
        preferredDestinationPostalCode: "28001",
        preferredDestinationCountry: "España",
      });
      const other = candidate({ zone: "Madrid", zonePostalCode: "28002" });
      expect(findCompatibleAvailabilities(mine, [other])).toEqual([other]);

      const mine2 = candidate({ zone: "Sevilla", zonePostalCode: "41001" });
      const other2 = candidate({
        zone: "Bilbao",
        zonePostalCode: "48001",
        preferredDestinationPostalCode: "41010",
        preferredDestinationCountry: "España",
      });
      expect(findCompatibleAvailabilities(mine2, [other2])).toEqual([other2]);
    });
  });
});
