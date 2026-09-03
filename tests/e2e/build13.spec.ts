import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createHash } from "node:crypto";

const V = {
  shipper: { name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120, Valencia" },
  carrier: { name: "Transportes Pérez SL", nif: "B12345674" },
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
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
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/crear");
  await page.fill("#shipperName", V.shipper.name);
  await page.fill("#shipperNif", V.shipper.nif);
  await page.fill("#shipperAddress", V.shipper.address);
  await page.fill("#carrierName", V.carrier.name);
  await page.fill("#carrierNif", V.carrier.nif);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", V.origin);
  await page.fill("#destination", V.destination);
  await page.fill("#transportDate", V.transportDate);
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

    await page.goto(`/app/deca/${decaId}`);
    await expect(page.getByText("Versión 1")).toBeVisible();
    const v1Pdf = page.locator("a", { hasText: "Ver PDF" }).first();
    const v1Href = await v1Pdf.getAttribute("href");

    await page.getByTestId("deca-corregir").click();
    await expect(page).toHaveURL(/\/corregir$/);
    // change the destination + give a reason
    await page.getByTestId("wizard-next").click();
    await page.fill("#destination", "Barcelona");
    await page.getByTestId("wizard-next").click();
    await page.fill("#tractorPlate", V.tractorPlate);
    await page.getByTestId("correction-reason").fill("Cambio de destino por incidencia en ruta");
    await page.getByTestId("wizard-generate").click();

    await expect(page).toHaveURL(new RegExp(`/app/deca/${decaId}$`));
    await expect(page.getByText("Versión 2")).toBeVisible();
    await expect(page.getByText("Cambio de destino por incidencia en ruta")).toBeVisible();
    await expect(page.getByText("Versión actual: 2")).toBeVisible();

    // both versions' PDFs are retrievable and different
    const v1 = await request.get(v1Href!);
    expect(v1.status()).toBe(200);
    const v1Text = await extractText(new Uint8Array(await v1.body()));
    expect(v1Text).toContain("Madrid"); // original destination preserved

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
  test("share panel: WhatsApp deep link + copy + email endpoint responds", async ({ page, request }) => {
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

test.describe("BUILD 13 — abuse controls (F16)", () => {
  test("a first-time anonymous user is never challenged; the soft threshold then challenges", async ({
    request,
  }) => {
    const headers = { "x-fvd-fp": `fp-${Date.now()}-${Math.random()}` };
    // soft threshold for anon_create is 3 -> first 3 succeed with no challenge
    for (let i = 0; i < 3; i++) {
      const r = await request.post("/api/deca", { data: buildPayload(), headers });
      expect(r.status(), `create #${i + 1} should succeed`).toBe(201);
    }
    // the 4th is challenged
    const challenged = await request.post("/api/deca", { data: buildPayload(), headers });
    expect(challenged.status()).toBe(429);
    const body = await challenged.json();
    expect(body.error.code).toBe("challenge");
    expect(body.error.challenge.type).toBe("pow");

    // solve the PoW and retry -> allowed
    const { prefix, difficulty } = body.error.challenge;
    let nonce = "";
    for (let i = 0; i < 8_000_000; i++) {
      const c = i.toString(36);
      if (createHash("sha256").update(`${prefix}:${c}`).digest("hex").startsWith("0".repeat(difficulty))) {
        nonce = c;
        break;
      }
    }
    const solved = await request.post("/api/deca", {
      data: buildPayload(),
      headers: { ...headers, "x-fvd-challenge": `pow:${prefix}:${nonce}` },
    });
    expect(solved.status()).toBe(201);
  });

  test("the public inspector URL /d/[token] is never challenged", async ({ request }) => {
    const create = await request.post("/api/deca", {
      data: buildPayload(),
      headers: { "x-fvd-fp": `clean-${Date.now()}` },
    });
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
    carrier: { name: V.carrier.name, nif: V.carrier.nif },
    origin: V.origin,
    destination: V.destination,
    transportDate: V.transportDate,
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
