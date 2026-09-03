import { describe, expect, it } from "vitest";
import { parseTouch, touchIsQualifying } from "@/lib/attribution/parse";
import {
  EMPTY_ATTRIBUTION,
  mergeTouch,
  mergeFromUrl,
  lock,
  toAcquisitionRow,
} from "@/lib/attribution/merge";

const at = (s: string) => new Date(s);

describe("parseTouch", () => {
  it("classifies a referral link and captures all five UTMs", () => {
    const t = parseTouch(
      new URLSearchParams(
        "ref=adrian&utm_source=whatsapp&utm_medium=direct&utm_campaign=lanzamiento_deca&utm_content=btn&utm_term=deca",
      ),
      { landingUrl: "/?ref=adrian", now: at("2026-09-01T10:00:00Z") },
    );
    expect(t.ref).toBe("adrian");
    expect(t.channel).toBe("referral");
    expect(t.utm).toEqual({
      utm_source: "whatsapp",
      utm_medium: "direct",
      utm_campaign: "lanzamiento_deca",
      utm_content: "btn",
      utm_term: "deca",
    });
  });
  it("classifies campaign / organic / direct", () => {
    expect(parseTouch(new URLSearchParams("utm_source=google"), { landingUrl: "/" }).channel).toBe("campaign");
    expect(parseTouch(new URLSearchParams(""), { landingUrl: "/", referrer: "https://google.com" }).channel).toBe("organic");
    expect(parseTouch(new URLSearchParams(""), { landingUrl: "/" }).channel).toBe("direct");
  });
  it("only referral/campaign touches are qualifying", () => {
    expect(touchIsQualifying(parseTouch(new URLSearchParams("ref=maria"), { landingUrl: "/" }))).toBe(true);
    expect(touchIsQualifying(parseTouch(new URLSearchParams(""), { landingUrl: "/" }))).toBe(false);
  });
});

describe("attribution merge rules (F12 / EPIC 02)", () => {
  const url = (s: string) => new URL(`https://deca.farvertrans.es${s}`);

  it("captures first-touch once and never overwrites it after signup", () => {
    let a = mergeFromUrl(EMPTY_ATTRIBUTION, url("/?ref=adrian"), null, at("2026-09-01T00:00:00Z"));
    expect(a.first?.ref).toBe("adrian");

    // returns via maria before signup -> last-touch updates, first stays adrian
    a = mergeFromUrl(a, url("/?ref=maria"), null, at("2026-09-02T00:00:00Z"));
    expect(a.first?.ref).toBe("adrian");
    expect(a.last?.ref).toBe("maria");

    // signup locks it
    a = lock(a, at("2026-09-03T00:00:00Z"));

    // a later ref=diana visit changes nothing
    a = mergeFromUrl(a, url("/?ref=diana"), null, at("2026-09-04T00:00:00Z"));
    expect(a.first?.ref).toBe("adrian");
    expect(a.last?.ref).toBe("maria");
  });

  it("a non-qualifying visit does not clobber an existing last-touch", () => {
    let a = mergeFromUrl(EMPTY_ATTRIBUTION, url("/?ref=adrian"), null);
    a = mergeFromUrl(a, url("/precios"), "https://google.com"); // organic, non-qualifying
    expect(a.last?.ref).toBe("adrian");
  });

  it("flattens to the acquisition row shape", () => {
    let a = mergeFromUrl(
      EMPTY_ATTRIBUTION,
      url("/?ref=adrian&utm_source=whatsapp&utm_campaign=lanzamiento"),
      null,
      at("2026-09-01T09:00:00Z"),
    );
    a = mergeFromUrl(a, url("/?ref=maria&utm_source=email"), null, at("2026-09-02T09:00:00Z"));
    const row = toAcquisitionRow(a);
    expect(row.firstRefCode).toBe("adrian");
    expect(row.lastRefCode).toBe("maria");
    expect(row.firstUtmSource).toBe("whatsapp");
    expect(row.lastUtmSource).toBe("email");
    expect(row.firstSeenAt?.toISOString()).toBe("2026-09-01T09:00:00.000Z");
  });

  it("mergeTouch is a no-op once locked", () => {
    const locked = lock(mergeFromUrl(EMPTY_ATTRIBUTION, url("/?ref=adrian"), null));
    const after = mergeTouch(locked, parseTouch(new URLSearchParams("ref=zzz"), { landingUrl: "/" }));
    expect(after).toBe(locked);
  });
});
