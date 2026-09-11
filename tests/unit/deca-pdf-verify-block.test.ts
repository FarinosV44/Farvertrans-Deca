import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { renderDecaPdf } from "@/lib/pdf/render";
import type { DecaPayload } from "@/lib/deca/schema";

/**
 * Layout regression (reported 2026-09-10): the public-verification URL rendered
 * into / under the QR code. Production tokens are ~43 characters of base64url
 * with no spaces, and @react-pdf 4.x has no word-break, so a plain text box let
 * the URL overflow right, across the QR.
 *
 * This renders the REAL PDF, reconstructs the QR image's page-space rectangle
 * from the content stream's CTM, reads the verification-band glyph runs, and
 * asserts the text never reaches the QR — for the current token length and a
 * deliberately longer one — while the QR keeps its size and the full URL is
 * still present.
 */

const payload: DecaPayload = {
  shipper: {
    name: "Transportes Ejemplo SL",
    nif: "B12345674",
    address: "Av. del Puerto 120, 46023 Valencia",
  },
  carrier: {
    name: "Logística del Turia SA",
    nif: "A96789011",
    address: "Pol. Fuente del Jarro, calle 5",
    postalCode: "46988",
    city: "Paterna",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  tractorPlate: "1234 BCD",
  trailerPlate: "R-4471",
  shipments: [
    {
      loadLocation: {
        name: "Almacén Turia",
        address: "Av. del Puerto 120",
        postalCode: "46023",
        city: "Valencia",
        province: "Valencia",
        country: "España",
      },
      unloadLocation: {
        name: "Plataforma Norte",
        address: "Calle Alcalá 200",
        postalCode: "28028",
        city: "Madrid",
        province: "Madrid",
        country: "España",
      },
      goods: "Palés de cerámica",
      weight: "12000 kg",
    },
  ],
};

// `newPublicToken()` is randomBytes(32).base64url → exactly 43 chars.
const TOKEN_43 = "rjZYIPYI72LdzcH0kBbxIy0_YnLJriPcxPD3ahdGEXM";
const CASES = {
  // the production shape: short domain + a real 43-char token
  standard: `https://decaprofesional.es/d/${TOKEN_43}`,
  // the Hostinger fallback domain is much longer — this is the shape that
  // actually overflowed the QR in production
  longDomain: `https://linen-mantis-554500.hostingersite.com/d/${TOKEN_43}`,
  // a deliberately oversized token, to prove the wrap scales
  extreme: `https://decaprofesional.es/d/${TOKEN_43}abcdefghijklmnopqrstuvwxyz0123456789`,
};

type Matrix = [number, number, number, number, number, number];
const mul = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
];

async function analyse(publicUrl: string) {
  const buf = await renderDecaPdf({
    data: payload,
    publicUrl,
    reference: "DECA-RJZYIPYI",
    versionNo: 1,
    createdAt: new Date("2026-10-06T08:41:00Z"),
  });
  expect(buf.subarray(0, 5).toString()).toBe("%PDF-");

  const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
  const page = await doc.getPage(doc.numPages); // verification band is on the last page

  // --- QR image rectangle, reconstructed from the content-stream CTM ---
  const ol = await page.getOperatorList();
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  const stack: Matrix[] = [];
  let qr: { left: number; right: number; bottom: number; top: number; width: number } | null = null;
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i];
    if (fn === OPS.save) stack.push(ctm);
    else if (fn === OPS.restore) ctm = stack.pop() ?? ctm;
    else if (fn === OPS.transform) ctm = mul(ol.argsArray[i] as Matrix, ctm);
    else if (fn === OPS.paintImageXObject) {
      const width = Math.abs(ctm[0]);
      const height = Math.abs(ctm[3]);
      const left = Math.min(ctm[4], ctm[0] + ctm[4]);
      const bottom = Math.min(ctm[5], ctm[3] + ctm[5]);
      if (width > 60 && width < 140)
        qr = { left, right: left + width, bottom, top: bottom + height, width };
    }
  }
  expect(qr, "QR image not found in the last page's content stream").not.toBeNull();

  // --- glyph runs, restricted to the verification band (its vertical span) ---
  const content = await page.getTextContent();
  const bandTop = 170; // "VERIFICACIÓN PÚBLICA" sits at ~y147; nothing else is this low
  const bandRuns = content.items
    .filter((it): it is Extract<typeof it, { str: string }> => "str" in it && it.str.trim() !== "")
    .map((it) => ({
      str: it.str,
      xLeft: it.transform[4],
      xRight: it.transform[4] + (it.width ?? 0),
      y: it.transform[5],
    }))
    .filter((r) => r.y < bandTop);

  const bandText = bandRuns
    .map((r) => r.str)
    .join("")
    .replace(/​/g, "");
  // URL runs = left-column runs that carry URL characters (one per wrapped line)
  const urlRuns = bandRuns.filter(
    (r) =>
      r.xLeft < qr!.left - 40 &&
      /https?:|decaprofesional|hostingersite|[A-Za-z0-9]{12}/.test(r.str),
  );
  return { qr: qr!, bandRuns, bandText, urlRuns };
}

describe("PDF verification block — URL never overlaps the QR", () => {
  for (const [label, url] of Object.entries(CASES)) {
    it(`${label} (${url.length} chars): URL wraps inside its column, clear of the QR`, async () => {
      const { qr, bandRuns, bandText, urlRuns } = await analyse(url);

      // 1. the whole URL is still present — nothing clipped or dropped
      expect(bandText).toContain(url);

      // 2. the URL wraps to >= 2 lines instead of running long
      expect(urlRuns.length).toBeGreaterThanOrEqual(2);

      // 3. NO left-column run reaches the QR (generous 20pt quiet zone)
      const offenders = bandRuns
        .filter((r) => r.xLeft < qr.left - 40 && r.xRight > qr.left - 20)
        .map((r) => `"${r.str}" ends at x${r.xRight.toFixed(0)} (QR.left=${qr.left.toFixed(0)})`);
      expect(offenders).toEqual([]);
    });
  }

  it("QR keeps its 96pt size and a wide quiet margin from the text", async () => {
    const { qr, bandRuns } = await analyse(CASES.standard);
    expect(qr.width).toBeGreaterThan(92);
    expect(qr.width).toBeLessThan(100);
    const textRight = Math.max(
      ...bandRuns.filter((r) => r.xLeft < qr.left - 40).map((r) => r.xRight),
    );
    expect(qr.left - textRight).toBeGreaterThan(30); // clear quiet zone
  });

  it("the QR caption stays centred under the QR, within its column", async () => {
    const { qr, bandRuns } = await analyse(CASES.standard);
    const caption = bandRuns.filter((r) => /escanea|versión vigente/i.test(r.str));
    expect(caption.length).toBeGreaterThan(0);
    for (const c of caption) {
      expect(c.xLeft).toBeGreaterThan(qr.left - 12);
      expect(c.xRight).toBeLessThan(qr.right + 12);
    }
  });
});
