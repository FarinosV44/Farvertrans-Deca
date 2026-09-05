import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";

/**
 * PRODUCT #39 — optional company logo on generated DeCA PDFs, built together
 * with the premium PDF redesign (#49). Upload/preview/remove in company
 * settings; baked into new documents only; historical PDFs never change.
 */

function email() {
  return `logo${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

/** A minimal but real, valid PNG (solid-fill), built by hand — no image library needed. */
function buildPng(r: number, g: number, b: number, w = 120, h = 40): Buffer {
  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (const byte of buf) {
      let c = (crc ^ byte) & 0xff;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeData), 0);
    return Buffer.concat([len, typeData, crc]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  const rowLen = 1 + w * 3;
  const raw = Buffer.alloc(rowLen * h);
  for (let y = 0; y < h; y++) {
    raw[y * rowLen] = 0;
    for (let x = 0; x < w; x++) {
      raw[y * rowLen + 1 + x * 3] = r;
      raw[y * rowLen + 1 + x * 3 + 1] = g;
      raw[y * rowLen + 1 + x * 3 + 2] = b;
    }
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function writeTempPng(name: string, r: number, g: number, b: number): string {
  const dir = mkdtempSync(path.join(tmpdir(), "fvd-logo-"));
  const file = path.join(dir, name);
  writeFileSync(file, buildPng(r, g, b));
  return file;
}

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Logo Test SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
}

async function createDeca(page: Page): Promise<string> {
  await page.goto("/crear");
  for (const [s, v] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1, Valencia"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
    ["#carrierAddress", "Av. Central 3, Madrid"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  for (const [s, v] of [
    ["#loadLocationName", "Almacén Valencia"],
    ["#loadLocationAddress", "Calle 1"],
    ["#loadLocationPostalCode", "46001"],
    ["#loadLocationCity", "Valencia"],
    ["#loadLocationProvince", "Valencia"],
    ["#loadLocationCountry", "España"],
    ["#loadDate", "2026-10-06"],
    ["#unloadLocationName", "Almacén Madrid"],
    ["#unloadLocationAddress", "Av. Central 3"],
    ["#unloadLocationPostalCode", "28001"],
    ["#unloadLocationCity", "Madrid"],
    ["#unloadLocationProvince", "Madrid"],
    ["#unloadLocationCountry", "España"],
    ["#unloadDate", "2026-10-06"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/([a-z0-9]+)/i, { timeout: 15_000 });
  return page.url().split("/crear/")[1].split("?")[0];
}

test.describe("PRODUCT #39 — company logo on the DeCA PDF", () => {
  test("upload → preview → new DeCA carries it → remove → historical PDF is byte-identical", async ({
    page,
    request,
  }) => {
    await register(page);
    await page.goto("/panel/empresa");
    await expect(page.getByRole("heading", { name: "Mi empresa" })).toBeVisible();
    await expect(page.getByTestId("company-logo-upload")).toBeVisible();

    // 1. Upload a real logo.
    await page.goto("/panel/empresa");
    const logoPath = writeTempPng("logo-orange.png", 255, 140, 0);
    await page.getByTestId("company-logo-input").setInputFiles(logoPath);
    await expect(page.getByTestId("company-logo-preview")).toBeVisible();
    await expect(page.getByTestId("company-logo-remove")).toBeVisible();

    // 2. Generate a DeCA now — its PDF should differ from one made without a logo.
    await createDeca(page);
    const urlWithLogo = await page.getByTestId("result-download").getAttribute("href");
    const pdfWithLogo = await request.get(urlWithLogo!);
    expect(pdfWithLogo.status()).toBe(200);
    const bytesWithLogo = Buffer.from(await pdfWithLogo.body());
    const hashWithLogo = createHash("sha256").update(bytesWithLogo).digest("hex");

    // 3. Remove the logo — a NEW document has none, the logo'd one is untouched.
    await page.goto("/panel/empresa");
    await page.getByTestId("company-logo-remove").click();
    await expect(page.getByTestId("company-logo-upload")).toBeVisible();

    await createDeca(page);
    const urlNoLogo = await page.getByTestId("result-download").getAttribute("href");
    const pdfNoLogo = await request.get(urlNoLogo!);
    const bytesNoLogo = Buffer.from(await pdfNoLogo.body());
    expect(bytesNoLogo.equals(bytesWithLogo)).toBe(false);

    // 4. Historical immutability: the earlier logo'd document is byte-for-byte unchanged.
    const recheck = await request.get(urlWithLogo!);
    const recheckBytes = Buffer.from(await recheck.body());
    expect(createHash("sha256").update(recheckBytes).digest("hex")).toBe(hashWithLogo);
  });

  test("rejects an oversized/invalid upload with a clear message, never crashes", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/empresa");

    // an SVG disguised with a .png name — the client checks the real MIME type
    await page.getByTestId("company-logo-input").setInputFiles({
      name: "not-an-image.png",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg></svg>"),
    });
    await expect(page.locator('p[role="alert"]')).toContainText(/PNG o JPEG/i);
  });

  test("the raw API rejects an SVG even with a spoofed content type", async ({ page }) => {
    await register(page);
    const svg = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>", "utf8");
    const res = await page.request.post("/api/company/logo", {
      data: { dataUri: `data:image/png;base64,${svg.toString("base64")}` },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("type");
  });

  test("a non-owner sees the logo read-only, with no upload control", async ({ page, browser }) => {
    await register(page);
    await page.goto("/panel/empresa");
    const logoPath = writeTempPng("logo-owner.png", 20, 90, 200);
    await page.getByTestId("company-logo-input").setInputFiles(logoPath);
    await expect(page.getByTestId("company-logo-preview")).toBeVisible();

    // invite a member and check their view
    await page.goto("/panel/equipo");
    const memberEmail = email();
    await page.fill('[data-testid="invite-email"]', memberEmail);
    await page.getByTestId("invite-submit").click();
    await expect(page.getByTestId("invite-msg")).toContainText(memberEmail);
    const inviteLink = (await page.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(inviteLink.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);
    await member.goto("/panel/empresa");
    await expect(member.getByTestId("company-logo-preview")).toBeVisible();
    await expect(member.getByTestId("company-logo-upload")).toHaveCount(0);
    await expect(member.getByTestId("company-logo-remove")).toHaveCount(0);
    await memberCtx.close();
  });
});
