import { describe, expect, it } from "vitest";
import { eventInputSchema, pickRefSnapshot } from "@/lib/analytics/events";

describe("pickRefSnapshot", () => {
  it("keeps only known ref/utm keys", () => {
    const p = new URLSearchParams(
      "ref=adrian&utm_source=whatsapp&utm_medium=direct&utm_campaign=lanzamiento&foo=bar&utm_content=&utm_term=deca",
    );
    expect(pickRefSnapshot(p)).toEqual({
      ref: "adrian",
      utm_source: "whatsapp",
      utm_medium: "direct",
      utm_campaign: "lanzamiento",
      utm_term: "deca",
    });
  });

  it("returns an empty object when there is nothing to capture", () => {
    expect(pickRefSnapshot(new URLSearchParams(""))).toEqual({});
  });

  it("drops absurdly long values", () => {
    const p = new URLSearchParams(`ref=${"x".repeat(500)}`);
    expect(pickRefSnapshot(p)).toEqual({});
  });
});

describe("eventInputSchema", () => {
  it("rejects an unknown event name", () => {
    const r = eventInputSchema.safeParse({ name: "hack", sessionId: "abcdefgh", path: "/" });
    expect(r.success).toBe(false);
  });

  it("accepts a valid landing_view event", () => {
    const r = eventInputSchema.safeParse({
      name: "landing_view",
      sessionId: "abcdefgh1234",
      path: "/",
      ref: { ref: "adrian" },
      appVersion: "0.1.0",
    });
    expect(r.success).toBe(true);
  });
});
