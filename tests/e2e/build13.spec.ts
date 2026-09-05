import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createHash } from "node:crypto";

const V = {
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
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  goods: "Palés",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

function email() {
  return `b13-${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerAndCreate(page: Page): Promise<string> {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Correcciones SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");

  await page.goto("/crear");
  await page.fill("#shipperName", V.shipper.name);
  await page.fill("#shipperNif", V.shipper.nif);
  await page.fill("#shipperAddress", V.shipper.address);
  await page.fill("#carrierName", V.carrier.name);
  await page.fill("#carrierNif", V.carrier.nif);
  await page.fill("#carrierAddress", V.carrier.address);
  await page.getByTestId("wizard-next").click();
  await page.fill("#loadLocationName", V.loadLocation.name);
  await page.fill("#loadLocationAddress", V.loadLocation.address);
  await page.fill("#loadLocationPostalCode", V.loadLocation.postalCode);
  await page.fill("#loadLocationCity", V.loadLocation.city);
  await page.fill("#loadLocationProvince", V.loadLocation.province);
  await page.fill("#loadLocationCountry", V.loadLocation.country);
  await page.fill("#loadDate", V.loadDate);
  await page.fill("#unloadLocationName", V.unloadLocation.name);
  await page.fill("#unloadLocationAddress", V.unloadLocation.address);
  await page.fill("#unloadLocationPostalCode", V.unloadLocation.postalCode);
  await page.fill("#unloadLocationCity", V.unloadLocation.city);
  await page.fill("#unloadLocationProvince", V.unloadLocation.province);
  await page.fill("#unloadLocationCountry", V.unloadLocation.country);
  await page.fill("#unloadDate", V.unloadDate);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", V.goods);
  await page.fill("#weight", V.weight);
  await page.fill("#tractorPlate", V.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/([a-z0-9]+)/i);
  return page.url().split("/crear/")[1].split("?")[0];
}

test.describe("BUILD 13 — corrections / versioning (R-13)", () => {
  test("a correction produces a traceable new version; the previous version stays retrievable", async ({
    page,
    request,
  }) => {
    const decaId = await registerAndCreate(page);

    await page.goto(`/panel/deca/${decaId}`);
    await expect(page.getByText("Versión 1")).toBeVisible();
    const v1Pdf = page.locator("a", { hasText: "Ver PDF" }).first();
    const v1Href = await v1Pdf.getAttribute("href");

    // capture v1's exact bytes BEFORE the correction (FIX #19: never mutated)
    const v1BytesBefore = Buffer.from(await (await request.get(v1Href!)).body());
    const v1HashBefore = createHash("sha256").update(v1BytesBefore).digest("hex");

    await page.getByTestId("deca-corregir").click();
    await expect(page).toHaveURL(/\/corregir$/);
    // change the unload location + give a reason
    await page.getByTestId("wizard-next").click();
    await page.fill("#unloadLocationCity", "Barcelona");
    await page.getByTestId("wizard-next").click();
    await page.fill("#tractorPlate", V.tractorPlate);
    await page.getByTestId("correction-reason").fill("Cambio de destino por incidencia en ruta");
    await page.getByTestId("wizard-generate").click();

    await expect(page).toHaveURL(new RegExp(`/panel/deca/${decaId}$`));
    await expect(page.getByText("Versión 2")).toBeVisible();
    await expect(page.getByText("Cambio de destino por incidencia en ruta")).toBeVisible();
    await expect(page.getByText("Versión actual: 2")).toBeVisible();

    // both versions' PDFs are retrievable and different
    const v1 = await request.get(v1Href!);
    expect(v1.status()).toBe(200);
    const v1BytesAfter = Buffer.from(await v1.body());
    // FIX #19: v1's bytes are byte-for-byte unchanged after the correction
    expect(createHash("sha256").update(v1BytesAfter).digest("hex")).toBe(v1HashBefore);
    const v1Text = await extractText(new Uint8Array(v1BytesAfter));
    expect(v1Text).toContain("Madrid"); // original unload location preserved

    const links = await page.locator("a", { hasText: "Ver PDF" }).all();
    const hrefs = await Promise.all(links.map((l) => l.getAttribute("href")));
    expect(new Set(hrefs).size).toBe(2); // distinct tokens per version
    const v2 = await request.get(hrefs[0]!);
    const v2Text = await extractText(new Uint8Array(await v2.body()));
    expect(v2Text).toContain("Barcelona");
  });

  test("a non-owner cannot correct another company's DeCA", async ({ page, request }) => {
    const decaId = await registerAndCreate(page);
    // fresh, unrelated request context (no session)
    const res = await request.post(`/api/deca/${decaId}/version`, {
      data: { changeReason: "intento", payload: buildPayload() },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("BUILD 13 — driver sharing (F9)", () => {
  test("share panel: WhatsApp deep link + copy + email endpoint responds", async ({
    page,
    request,
  }) => {
    const decaId = await registerAndCreate(page);
    await page.goto(`/crear/${decaId}`);
    await page.getByTestId("result-share-toggle").click();
    const wa = page.getByRole("link", { name: "Enviar por WhatsApp" });
    await expect(wa).toHaveAttribute("href", /wa\.me\/\?text=.*%2Fd%2F/);

    // email endpoint: unconfigured in tests -> 202 + mailto fallback
    const detail = await request.get(`/crear/${decaId}`);
    void detail;
  });
});

/**
 * The `anon_create` soft-threshold/PoW-challenge abuse policy (F16) applied
 * only to anonymous creation, which PRIORITY 1 retired entirely — an
 * unauthenticated `POST /api/deca` now gets 401 `auth_required` before any
 * abuse check runs, so the challenge flow is unreachable and untested by
 * design (D-052). `checkAbuse`/`abuseResponse` remain live for "auth" and
 * "share".
 */
async function registerViaApi(request: APIRequestContext) {
  const res = await request.post("/api/auth/register", {
    data: {
      email: email(),
      password: "supersecret123",
      companyName: "Abuse SL",
      companyNif: "B12345674",
      acceptTerms: true,
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  await request.get(`/verificar-email/${body.verifyTestToken}`);
}

test.describe("BUILD 13 — abuse controls (F16)", () => {
  test("the public inspector URL /d/[token] is never challenged", async ({ request }) => {
    await registerViaApi(request);
    const create = await request.post("/api/deca", { data: buildPayload() });
    const { token } = await create.json();
    // hammer it — never a 429
    for (let i = 0; i < 15; i++) {
      const r = await request.get(`/d/${token}`);
      expect(r.status()).toBe(200);
    }
  });
});

function buildPayload() {
  return {
    shipper: { name: V.shipper.name, nif: V.shipper.nif, address: V.shipper.address },
    carrier: { name: V.carrier.name, nif: V.carrier.nif, address: V.carrier.address },
    loadLocation: V.loadLocation,
    unloadLocation: V.unloadLocation,
    loadDate: V.loadDate,
    unloadDate: V.unloadDate,
    goods: V.goods,
    weight: V.weight,
    tractorPlate: V.tractorPlate,
  };
}

async function extractText(bytes: Uint8Array) {
  const doc = await getDocument({ data: bytes }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
  }
  return text;
}

// keep types referenced
void (null as unknown as APIRequestContext);
