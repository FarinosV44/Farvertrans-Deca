import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

function email(p = "lg") {
  return `${p}-${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerCompany(page: Page, name: string) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", name);
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/app$/);
}

async function createDeca(page: Page): Promise<string> {
  await page.goto("/crear");
  for (const [s, v] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", "Valencia");
  await page.fill("#destination", "Madrid");
  await page.fill("#transportDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Palés");
  await page.fill("#weight", "12000 kg");
  await page.fill("#tractorPlate", "1234 BCD");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/([a-z0-9]+)/i);
  return page.url().split("/crear/")[1].split("?")[0];
}

test.describe("BUILD 15 — launch gate", () => {
  test("no cross-tenant data access: company B cannot read company A's DeCA", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const a = await ctxA.newPage();
    await registerCompany(a, "Empresa A SL");
    const decaId = await createDeca(a);
    await ctxA.close();

    const ctxB = await browser.newContext();
    const b = await ctxB.newPage();
    await registerCompany(b, "Empresa B SL");

    // detail page → notFound for B
    expect((await b.goto(`/app/deca/${decaId}`))?.status()).toBe(404);
    // correction page → notFound for B
    expect((await b.goto(`/app/deca/${decaId}/corregir`))?.status()).toBe(404);
    // correction API → 404 (company-scoped lookup fails)
    const corr = await b.request.post(`/api/deca/${decaId}/version`, {
      data: { changeReason: "intento cross-tenant", payload: buildPayload() },
    });
    expect([403, 404]).toContain(corr.status());
    // B's history does not contain A's document
    await b.goto("/app/historico");
    await expect(b.getByText("0 documentos")).toBeVisible();
    await ctxB.close();
  });

  test("security headers are present on HTML responses", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).not.toContain("'unsafe-eval'"); // prod build
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("geolocation=()");
  });

  test("public tokens are high-entropy and not enumerable", async ({ request }) => {
    const tokens: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await request.post("/api/deca", {
        data: buildPayload(),
        headers: { "x-fvd-fp": `entropy-${Date.now()}-${i}` },
      });
      tokens.push((await r.json()).token);
    }
    for (const t of tokens) {
      expect(t).toMatch(/^[A-Za-z0-9_-]{40,}$/); // ≥ 240 bits base64url
    }
    expect(new Set(tokens).size).toBe(3);
    // an incremented / adjacent guess does not resolve
    const guess = tokens[0].slice(0, -1) + (tokens[0].endsWith("A") ? "B" : "A");
    expect((await request.get(`/d/${guess}`)).status()).toBe(404);
  });

  test("failure paths: malformed input and unknown resources fail cleanly, never 5xx a beacon", async ({
    request,
  }) => {
    expect((await request.post("/api/deca", { data: { nope: true } })).status()).toBe(422);
    expect((await request.post("/api/events", { data: "not json" })).status()).toBe(204);
    expect((await request.get("/d/short")).status()).toBe(404);
    expect((await request.post("/api/share", { data: { token: "x", to: "bad" } })).status()).toBe(
      422,
    );
    const health = await request.get("/health");
    expect([200, 503]).toContain(health.status());
  });
});

function buildPayload() {
  return {
    shipper: { name: "Cargas SL", nif: "B96789011", address: "Calle 1" },
    carrier: { name: "Trans SL", nif: "B12345674" },
    origin: "Valencia",
    destination: "Madrid",
    transportDate: "2026-10-06",
    goods: "Palés",
    weight: "12000 kg",
    tractorPlate: "1234 BCD",
  };
}

void (null as unknown as APIRequestContext);
