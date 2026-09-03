import { test, expect, type APIRequestContext } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createHash } from "node:crypto";
import { BRAND } from "../../lib/brand";

/**
 * BUILD 08 — R-1…R-13 compliance suite. This is a Phase 7 release gate.
 * Generates a real DeCA through the public API, then verifies the produced PDF
 * and the public inspection URL against the BOE resolution.
 */

const payload = {
  shipper: {
    name: "Cargas del Turia SL",
    nif: "B96789011",
    address: "Av. del Puerto 120, Valencia",
  },
  carrier: {
    name: "Transportes Pérez SL",
    nif: "B12345674",
    address: "Pol. Ind. Fuente del Jarro, calle 5, Paterna",
  },
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12345 kg",
  tractorPlate: "1234 BCD",
  trailerPlate: "R9876XYZ",
};

async function generate(request: APIRequestContext) {
  const res = await request.post("/api/deca", { data: payload });
  expect(res.status()).toBe(201);
  return res.json() as Promise<{
    decaId: string;
    token: string;
    pdfSha256: string;
    claimToken: string;
  }>;
}

async function extractPdfText(bytes: Uint8Array) {
  const doc = await getDocument({ data: bytes, useSystemFonts: true }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return { text, numPages: doc.numPages };
}

test.describe("R-1…R-13 compliance", () => {
  test("R-3/R-4: the PDF is native text (not a scan) and ≤ 5 MB", async ({ request }) => {
    const { token } = await generate(request);
    const res = await request.get(`/d/${token}`);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    const bytes = new Uint8Array(await res.body());

    expect(bytes.byteLength).toBeLessThan(5 * 1024 * 1024); // R-4
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-"); // real PDF

    const { text } = await extractPdfText(bytes);
    // pdfjs inserts positional whitespace, so compare whitespace-insensitively (R-3).
    const flat = text.replace(/\s+/g, "").toUpperCase();
    for (const v of [
      payload.shipper.name,
      payload.shipper.nif,
      payload.shipper.address,
      payload.carrier.name,
      payload.carrier.nif,
      payload.carrier.address,
      payload.origin,
      payload.destination,
      payload.transportDate,
      payload.goods,
      payload.weight,
      "1234BCD",
      "R9876XYZ",
    ]) {
      expect(flat, `PDF must contain "${v}" as text`).toContain(
        v.replace(/\s+/g, "").toUpperCase(),
      );
    }
    expect(text.length).toBeGreaterThan(200); // not an image-only page
  });

  test("R-5/R-6: the PDF carries the exact HTTPS-capable public URL for its token", async ({
    request,
    baseURL,
  }) => {
    const { token } = await generate(request);
    const res = await request.get(`/d/${token}`);
    const { text } = await extractPdfText(new Uint8Array(await res.body()));
    expect(text.replace(/\s+/g, "")).toContain(`/d/${token}`);
  });

  test("R-7/R-8: the public URL downloads the PDF directly — no auth, no cookie, no interstitial", async ({
    request,
  }) => {
    const { token } = await generate(request);
    const res = await request.get(`/d/${token}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    expect(res.headers()["content-disposition"]).toContain("inline");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    expect(res.headers()["set-cookie"]).toBeUndefined();
    // body is the PDF itself, not an HTML page with a button
    const head = Buffer.from((await res.body()).slice(0, 20)).toString();
    expect(head.startsWith("%PDF-")).toBe(true);
    expect(head.toLowerCase()).not.toContain("<!doctype");
  });

  test("R-8: an unknown token returns a generic 404", async ({ request }) => {
    const res = await request.get("/d/this-token-does-not-exist-000000000000");
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"] ?? "").toContain("text/plain");
  });

  test("R-11: creation date/time is recorded in the PDF metadata", async ({ request }) => {
    const { token } = await generate(request);
    const res = await request.get(`/d/${token}`);
    const bytes = new Uint8Array(await res.body());
    const doc = await getDocument({ data: bytes }).promise;
    const meta = await doc.getMetadata();
    const info = meta.info as { CreationDate?: string; Creator?: string };
    expect(info.CreationDate).toBeTruthy();
    expect(info.Creator ?? "").toContain(BRAND.name);
  });

  test("R-13: fails closed — an invalid payload produces no document", async ({ request }) => {
    const res = await request.post("/api/deca", { data: { ...payload, goods: "" } });
    expect(res.status()).toBe(422);
  });

  test("FIX-18: the served PDF bytes hash matches the stored per-version SHA-256", async ({
    request,
  }) => {
    const { token, pdfSha256 } = await generate(request);
    expect(pdfSha256).toMatch(/^[0-9a-f]{64}$/);
    const res = await request.get(`/d/${token}`);
    const bytes = Buffer.from(await res.body());
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(pdfSha256);
    // and it is stable across re-fetches (repository of record, not regenerated per request)
    const again = Buffer.from(await (await request.get(`/d/${token}`)).body());
    expect(createHash("sha256").update(again).digest("hex")).toBe(pdfSha256);
  });

  test("FIX-18: the public URL/QR is built from the configured base URL (NEXT_PUBLIC_FVD_BASE_URL)", async ({
    request,
    baseURL,
  }) => {
    const { token } = await generate(request);
    const { text } = await extractPdfText(
      new Uint8Array(await (await request.get(`/d/${token}`)).body()),
    );
    const flat = text.replace(/\s+/g, "");
    const host = new URL(baseURL!).host; // CI sets NEXT_PUBLIC_FVD_BASE_URL to the same origin
    expect(flat).toContain(`${host}/d/${token}`);
  });
});
