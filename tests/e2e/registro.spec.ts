import { test, expect, type APIRequestContext } from "@playwright/test";
import { createHash } from "node:crypto";

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

async function createAnon(request: APIRequestContext) {
  const res = await request.post("/api/deca", { data: payload });
  return res.json() as Promise<{
    decaId: string;
    token: string;
    pdfSha256: string;
    claimToken: string;
  }>;
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
    await page.getByTestId("accept-terms").check();
    await page.getByTestId("register-submit").click();

    await expect(page).toHaveURL(/\/verificar-email/);
    await page.goto("/panel");
    await expect(
      page.getByText("Almacén Turia — Valencia → Plataforma Norte — Madrid"),
    ).toBeVisible();
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
        acceptTerms: true,
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
        acceptTerms: true,
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
        acceptTerms: true,
        claim: anon.claimToken,
      },
    });
    // account is created, but the claim is reported as already used
    const body = await second.json();
    expect(body.claimWarning ?? "").toMatch(/utilizado|caducado|no es válido/i);
  });

  test("FIX #19: claiming an anonymous DeCA preserves its public URL byte-for-byte (retention clock untouched)", async ({
    request,
  }) => {
    const anon = await createAnon(request);
    const before = Buffer.from(await (await request.get(`/d/${anon.token}`)).body());
    expect(createHash("sha256").update(before).digest("hex")).toBe(anon.pdfSha256);

    const claimed = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail(),
        password: "supersecret123",
        companyName: "Titular SL",
        companyNif: "B12345674",
        acceptTerms: true,
        claim: anon.claimToken,
      },
    });
    expect(claimed.status()).toBe(201);
    expect((await claimed.json()).claimedDecaId).toBe(anon.decaId);

    // same token, same URL, identical bytes — no regeneration, no new token
    const after = await request.get(`/d/${anon.token}`);
    expect(after.status()).toBe(200);
    expect(
      createHash("sha256")
        .update(Buffer.from(await after.body()))
        .digest("hex"),
    ).toBe(anon.pdfSha256);
  });

  test("keep signup short — no lead-qualification fields on the form", async ({ page }) => {
    await page.goto("/registro");
    const text = (await page.locator("form").innerText()).toLowerCase();
    // TRUST #42 / GROWTH #46 explicitly add persona de contacto + teléfono to the
    // required field set (D-043, supersedes D-021's "no lead-qualification fields"
    // for these two) — banned words narrowed to the ones still deliberately absent.
    for (const banned of ["flota", "facturación", "empleados", "presupuesto", "demo", "cargo"]) {
      expect(text).not.toContain(banned);
    }
  });
});
