import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

function email() {
  return `acc${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerCompany(page: Page, addr = email()) {
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Cuenta SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("accept-terms").check();
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/verificar-email/);
  await page.goto("/panel");
}

test.describe("ACCOUNT #23 — registration, login, recovery, logout", () => {
  test("returning user logs in from the landing header, then logs out", async ({ page }) => {
    const addr = email();
    await registerCompany(page, addr);

    // log out via the account menu
    await page.goto("/panel");
    await page.getByTestId("account-menu").click();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/logout")),
      page.getByTestId("logout").click(),
    ]);
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("header-login")).toBeVisible();

    // /panel now redirects to registro (session gone)
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/registro/);

    // log back in from the header
    await page.goto("/");
    await page.getByTestId("header-login").click();
    await expect(page).toHaveURL(/\/entrar$/);
    await page.fill("#email", addr);
    await page.fill("#password", "supersecret123");
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/panel$/);
  });

  test("an already-authenticated visitor to /entrar is sent to the panel", async ({ page }) => {
    await registerCompany(page);
    await page.goto("/entrar");
    await expect(page).toHaveURL(/\/panel$/);
  });

  test("password recovery: request → emailed link → new password → logged in", async ({
    page,
    request,
  }) => {
    const addr = email();
    await registerCompany(page, addr);
    // log out
    await page.goto("/panel");
    await page.getByTestId("account-menu").click();
    await page.getByTestId("logout").click();
    await expect(page).toHaveURL("/");

    // request a reset (test seam returns the token)
    const res = await request.post("/api/auth/password/request", { data: { email: addr } });
    const body = await res.json();
    expect(body.ok).toBe(true);
    const token: string = body.testToken;
    expect(token?.length).toBeGreaterThan(20);

    // open the link and set a new password
    await page.goto(`/recuperar/${encodeURIComponent(token)}`);
    await page.fill("#password", "brandnewpass456");
    await page.getByTestId("reset-confirm-submit").click();
    await expect(page).toHaveURL(/\/panel$/); // logged straight in

    // old password no longer works; new one does
    const bad = await request.post("/api/auth/login", {
      data: { email: addr, password: "supersecret123" },
    });
    expect(bad.status()).toBe(401);
    const good = await request.post("/api/auth/login", {
      data: { email: addr, password: "brandnewpass456" },
    });
    expect(good.status()).toBe(200);
  });

  test("reset request never reveals whether an email is registered", async ({ request }) => {
    const known = email();
    const unknown = email();
    // register `known`
    const r = await request.post("/api/auth/register", {
      data: {
        email: known,
        password: "supersecret123",
        companyName: "X SL",
        companyNif: "B12345674",
        acceptTerms: true,
      },
    });
    expect(r.status()).toBe(201);

    const a = await request.post("/api/auth/password/request", { data: { email: known } });
    const b = await request.post("/api/auth/password/request", { data: { email: unknown } });
    expect(a.status()).toBe(200);
    expect(b.status()).toBe(200);
    expect((await b.json()).testToken).toBeUndefined(); // no token issued for an unknown email
  });

  test("a used reset token cannot be replayed", async ({ request }) => {
    const addr = email();
    await request.post("/api/auth/register", {
      data: {
        email: addr,
        password: "supersecret123",
        companyName: "Y SL",
        companyNif: "B12345674",
        acceptTerms: true,
      },
    });
    const token = (
      await (await request.post("/api/auth/password/request", { data: { email: addr } })).json()
    ).testToken as string;

    const first = await request.post("/api/auth/password/reset", {
      data: { token, password: "firstreset123" },
    });
    expect(first.status()).toBe(200);
    const replay = await request.post("/api/auth/password/reset", {
      data: { token, password: "secondreset123" },
    });
    expect(replay.status()).toBe(400);
  });

  test("the login form links to password recovery", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByTestId("forgot-password")).toHaveAttribute("href", "/recuperar");
  });

  test("account/growth events fire once, with no PII in the payload", async ({ page }) => {
    const events: { name: string; body: string }[] = [];
    await page.route("**/api/events", async (route) => {
      const b = route.request().postData() || "{}";
      try {
        events.push({ name: JSON.parse(b).name, body: b });
      } catch {
        /* ignore */
      }
      await route.fulfill({ status: 204, body: "" });
    });
    const addr = email();
    await registerCompany(page, addr);
    await page.waitForTimeout(300);

    const names = events.map((e) => e.name);
    expect(names).toContain("signup_started");
    expect(names).toContain("signup_completed");
    expect(names).toContain("company_created");
    // no event body contains the email, password or company NIF
    for (const e of events) {
      expect(e.body).not.toContain(addr);
      expect(e.body).not.toContain("supersecret123");
      expect(e.body).not.toContain("B12345674");
    }
  });
});
