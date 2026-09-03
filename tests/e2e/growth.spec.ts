import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

function email() {
  return `gr${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function loginInternal(request: APIRequestContext) {
  const r = await request.post("/api/auth/login", {
    data: { email: "admin@farvertrans.local", password: "admin-dev-only" },
  });
  expect(r.status(), "run npm run seed").toBe(200);
}

async function registerViaLink(page: Page, link: string, addr: string) {
  await page.goto(link.replace(/^https?:\/\/[^/]+/, ""));
  await page.fill("#email", addr);
  await page.fill("#password", "supersecret123");
  // prospect link → company fields shown (prefilled); fill NIF if empty
  if ((await page.locator("#companyNif").inputValue()) === "") {
    await page.fill("#companyNif", "B12345674");
  }
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/panel$/);
}

async function createDeca(page: Page) {
  await page.goto("/crear");
  for (const [s, v] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
    ["#carrierAddress", "Av 2"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", "León");
  await page.fill("#destination", "Vigo");
  await page.fill("#transportDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Madera");
  await page.fill("#weight", "9000 kg");
  await page.fill("#tractorPlate", "3210 HHH");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
}

test.describe("GROWTH #28 — company acquisition engine", () => {
  test("/operadores/captacion is internal-only", async ({ page, request }) => {
    expect((await page.goto("/operadores/captacion"))?.status()).toBe(404);
    expect(
      (
        await request.post("/api/operadores/prospects", {
          data: { action: "invite", prospectId: "x" },
        })
      ).status(),
    ).toBe(404);
  });

  test("operator seeds a prospect → invite link → prospect registers → first DeCA activates the funnel", async ({
    browser,
    request,
  }) => {
    await loginInternal(request);
    const ref = `op${Date.now() % 100000}`;

    // seed a prospect
    const created = await request.post("/api/operadores/prospects", {
      data: { action: "create", name: "Prospecto Log SL", nif: "B55667788", refCode: ref },
    });
    expect(created.status()).toBe(201);
    const prospectId = (await created.json()).prospect.id;

    // generate the operator-attributed onboarding link
    const inv = await request.post("/api/operadores/prospects", {
      data: { action: "invite", prospectId },
    });
    const { link } = await inv.json();
    expect(link).toContain("/registro?invite=");
    // the token is opaque — no NIF / operator code in plain sight
    expect(link).not.toContain("B55667788");
    expect(link).not.toContain(ref);

    // the prospect registers through the link — a NEW company, prefilled name
    const prospectCtx = await browser.newContext();
    const p = await prospectCtx.newPage();
    await p.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(p.locator("#companyName")).toHaveValue("Prospecto Log SL");
    await registerViaLink(p, link, email());
    await createDeca(p);
    await prospectCtx.close();

    // funnel reflects: registered + activated, attributed to the operator
    const stats = await (await request.get("/api/operadores/stats")).json();
    const opRow =
      stats.operators.find((o: { refCode: string }) => o.refCode === ref) ??
      stats.unknown.find((o: { refCode: string }) => o.refCode === ref);
    expect(opRow?.firstDeca ?? 0).toBeGreaterThanOrEqual(1); // operator attribution survived to the first DeCA

    const page2Ctx = await browser.newContext();
    const admin = await page2Ctx.newPage();
    await admin.goto("/entrar");
    await admin.fill("#email", "admin@farvertrans.local");
    await admin.fill("#password", "admin-dev-only");
    await Promise.all([
      admin.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      admin.getByTestId("register-submit").click(),
    ]);
    await admin.goto("/operadores/captacion", { waitUntil: "networkidle" });
    await expect(admin.getByTestId("prospect-table").locator("tr", { hasText: ref })).toContainText(
      "Activado",
    );
    await expect(admin.getByTestId("funnel-table")).toContainText(ref);
    await page2Ctx.close();
  });

  test("bulk import creates prospects and skips obvious duplicates", async ({ request }) => {
    await loginInternal(request);
    const ref = `bulk${Date.now() % 100000}`;
    const text = `Alfa Transportes SL, B11111111, alfa@x.com, ${ref}\nBeta Cargas SL, , , ${ref}\nAlfa Transportes SL, B11111111, alfa@x.com, ${ref}`;
    const res = await request.post("/api/operadores/prospects", {
      data: { action: "import", text },
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.created).toBe(2); // Alfa + Beta; the repeated Alfa line is skipped
  });
});
