import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const upsert = vi.fn();
const eventCreate = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    commercialConsent: {
      upsert: (...a: unknown[]) => upsert(...a),
    },
    commercialConsentEvent: {
      create: (...a: unknown[]) => eventCreate(...a),
    },
  },
}));

import { setCommercialMode, setCommercialChannel, revokeCommercial } from "@/lib/consent";

const row = (over: Record<string, unknown> = {}) => ({
  mode: "all",
  channel: null,
  contactEmail: null,
  contactPhone: null,
  version: "2026-09-15",
  grantedAt: new Date(),
  revokedAt: null,
  updatedAt: new Date(),
  ...over,
});

beforeEach(() => {
  upsert.mockReset().mockResolvedValue(row());
  eventCreate.mockReset().mockResolvedValue({});
});

describe("setCommercialMode (#84)", () => {
  it("choosing a non-none mode stamps grantedAt, clears revokedAt, and logs mode_set", async () => {
    upsert.mockResolvedValue(row({ mode: "per_deca" }));
    await setCommercialMode("c1", "per_deca", "u1");
    const arg = upsert.mock.calls[0][0];
    expect(arg.where).toEqual({ companyId: "c1" });
    expect(arg.update).toMatchObject({ mode: "per_deca", revokedAt: null });
    expect(arg.update.grantedAt).toBeInstanceOf(Date);
    expect(eventCreate.mock.calls[0][0].data).toMatchObject({
      companyId: "c1",
      actorUserId: "u1",
      kind: "mode_set",
      mode: "per_deca",
      legalVersion: "2026-09-15",
    });
  });

  it("choosing 'none' stamps revokedAt and logs global_revoked", async () => {
    upsert.mockResolvedValue(row({ mode: "none", revokedAt: new Date() }));
    await setCommercialMode("c1", "none", "u1");
    expect(upsert.mock.calls[0][0].update).toMatchObject({ mode: "none" });
    expect(upsert.mock.calls[0][0].update.revokedAt).toBeInstanceOf(Date);
    expect(eventCreate.mock.calls[0][0].data.kind).toBe("global_revoked");
  });

  it("an audit-log failure never propagates", async () => {
    eventCreate.mockRejectedValue(new Error("db down"));
    await expect(setCommercialMode("c1", "all", null)).resolves.toBeTruthy();
  });
});

describe("setCommercialChannel (#84)", () => {
  it("channel 'email' keeps the email and nulls the phone", async () => {
    await setCommercialChannel(
      "c1",
      { channel: "email", contactEmail: " a@b.example ", contactPhone: "600111222" },
      "u1",
    );
    expect(upsert.mock.calls[0][0].update).toMatchObject({
      channel: "email",
      contactEmail: "a@b.example",
      contactPhone: null,
    });
    expect(eventCreate.mock.calls[0][0].data).toMatchObject({
      kind: "channel_set",
      channel: "email",
    });
  });

  it("channel 'phone' keeps the phone and nulls the email", async () => {
    await setCommercialChannel(
      "c1",
      { channel: "phone", contactEmail: "a@b.example", contactPhone: "600111222" },
      "u1",
    );
    expect(upsert.mock.calls[0][0].update).toMatchObject({
      channel: "phone",
      contactEmail: null,
      contactPhone: "600111222",
    });
  });

  it("channel 'both' keeps both", async () => {
    await setCommercialChannel(
      "c1",
      { channel: "both", contactEmail: "a@b.example", contactPhone: "600111222" },
      "u1",
    );
    expect(upsert.mock.calls[0][0].update).toMatchObject({
      contactEmail: "a@b.example",
      contactPhone: "600111222",
    });
  });
});

describe("revokeCommercial", () => {
  it("is setCommercialMode(none) — revokedAt + global_revoked", async () => {
    upsert.mockResolvedValue(row({ mode: "none", revokedAt: new Date() }));
    await revokeCommercial("c1", "u1");
    expect(upsert.mock.calls[0][0].update.mode).toBe("none");
    expect(eventCreate.mock.calls[0][0].data.kind).toBe("global_revoked");
  });
});
