import { describe, expect, it } from "vitest";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { qrPngBuffer } from "@/lib/pdf/qr";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import { newPublicToken } from "@/lib/deca/token";

describe("QR round-trip (R-5 / AC-07)", () => {
  it("a QR generated for a URL decodes back to exactly that URL", async () => {
    const url = "https://deca.farvertrans.es/d/AbC-123_xyz456";
    const png = PNG.sync.read(await qrPngBuffer(url));
    const decoded = jsQR(
      Uint8ClampedArray.from(png.data),
      png.width,
      png.height,
    );
    expect(decoded?.data).toBe(url);
  });
});

describe("public token (R-8 — non-enumerable)", () => {
  it("is long, url-safe and unique across calls", () => {
    const a = newPublicToken();
    const b = newPublicToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{40,}$/); // 32 bytes base64url ≈ 43 chars
  });
});

describe("7-day deactivation (R-9)", () => {
  const end = new Date("2026-10-06T00:00:00Z");
  it("is available while the service is not marked ended", () => {
    expect(isPubliclyAvailable(null)).toBe(true);
  });
  it("is available up to 7 natural days after the service end", () => {
    expect(isPubliclyAvailable(end, new Date("2026-10-12T23:00:00Z"))).toBe(true);
    expect(isPubliclyAvailable(end, new Date("2026-10-13T01:00:00Z"))).toBe(false);
  });
});
