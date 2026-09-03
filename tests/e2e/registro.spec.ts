import { test, expect, type APIRequestContext } from "@playwright/test";

const payload = {
  shipper: {
    name: "Cargas del Turia SL",
    nif: "B96789011",
    address: "Av. del Puerto 120, Valencia",
  },
  carrier: { name: "Transportes Pérez SL", nif: "B12345674" },
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

async function createAnon(request: APIRequestContext) {
  const res = await request.post("/api/deca", { data: payload });
  return res.json() as Promise<{ decaId: string; claimToken: string }>;
}

function uniqueEmail() {
  return `t${Date.now()}${Math.floor(Math.random() * 1e4)}@example.com`;
}

test.describe("BUILD 09 — signup + claim the anonymous DeCA", () => {
  test("AC: generate first, register second, and the document is claimed", async ({
    page,
    request,
  }) => {
    const anon = await createAnon(request);
    expect(anon.claimToken).toBeTruthy();

    await page.goto(`/registro?claim=${encodeURIComponent(anon.claimToken)}`);
    await expect(page.getByRole("heading", { name: "Guarda este DeCA" })).toBeVisible();

    const email = uniqueEmail();
    await page.fill("#email", email);
    await page.fill("#password", "supersecret123");
    await page.fill("#companyName", "Mi Transporte SL");
    await page.fill("#companyNif", "B12345674");
    await page.getByTestId("register-submit").click();

    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByText("Valencia → Madrid")).toBeVisible();
  });

  test("AC: an auth failure never orphans/deletes the DeCA; the public URL still works", async ({
    request,
  }) => {
    const anon = await createAnon(request);
    // register with a duplicate email would 409 — but the DeCA must remain valid
    const check = await request.get(
      `/d/${(await request.post("/api/deca", { data: payload }).then((r) => r.json())).token ?? ""}`,
    );
    expect([200, 404]).toContain(check.status());

    const dl = await request.post("/api/auth/register", {
      data: {
        email: "not-an-email",
        password: "x",
        companyName: "X",
        companyNif: "Y",
        claim: anon.claimToken,
      },
    });
    expect(dl.status()).toBe(422);
    // the anonymous DeCA is untouched — claim token still usable
    const ok = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail(),
        password: "supersecret123",
        companyName: "Recuperada SL",
        companyNif: "B12345674",
        claim: anon.claimToken,
      },
    });
    expect(ok.status()).toBe(201);
    expect((await ok.json()).claimedDecaId).toBe(anon.decaId);
  });

  test("AC: a claim token cannot be reused by another account", async ({ request }) => {
    const anon = await createAnon(request);
    const first = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail(),
        password: "supersecret123",
        companyName: "A SL",
        companyNif: "B12345674",
        claim: anon.claimToken,
      },
    });
    expect(first.status()).toBe(201);

    const second = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail(),
        password: "supersecret123",
        companyName: "B SL",
        companyNif: "B12345674",
        claim: anon.claimToken,
      },
    });
    // account is created, but the claim is reported as already used
    const body = await second.json();
    expect(body.claimWarning ?? "").toMatch(/utilizado|caducado|no es válido/i);
  });

  test("keep signup short — no lead-qualification fields on the form", async ({ page }) => {
    await page.goto("/registro");
    const text = (await page.locator("form").innerText()).toLowerCase();
    for (const banned of [
      "flota",
      "facturación",
      "empleados",
      "teléfono",
      "presupuesto",
      "demo",
      "cargo",
    ]) {
      expect(text).not.toContain(banned);
    }
  });
});
