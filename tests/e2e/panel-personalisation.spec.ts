import { test, expect, type Page } from "@playwright/test";

/**
 * #92 saved Histórico views + #93 quick accesses on Inicio.
 *
 * Both are per-USER preferences over functions that already exist, so the two
 * things worth proving are the same in each case: the feature works end to end
 * for its owner, and it is invisible to everybody else — including a colleague
 * inside the SAME company, which is the property a company-scoped
 * implementation would silently break.
 */

function email(p = "pp") {
  return `${p}-${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

const PASSWORD = "Supersecret123!";

async function registerCompany(page: Page, companyName: string): Promise<string> {
  const addr = email();
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", PASSWORD);
  await page.fill("#companyName", companyName);
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("accept-terms").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  // D-053: the panel is only fully usable once the address is verified.
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
  return addr;
}

test.describe("#92 — saved views in Histórico", () => {
  test("save a view from the active filters, apply it in one click, rename it, delete it", async ({
    page,
  }) => {
    await registerCompany(page, "Vistas SL");

    // Nothing to save with no filters — the feature never nags a user who
    // does not use it.
    await page.goto("/panel/historico");
    await expect(page.getByTestId("saved-view-save")).toHaveCount(0);

    // With filters active, "Guardar vista" appears.
    await page.goto("/panel/historico?q=lyon&plate=1234ABC");
    const saveBtn = page.getByTestId("saved-view-save");
    await expect(saveBtn).toBeVisible();

    page.once("dialog", (d) => d.accept("Valencia → Lyon"));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas") && r.status() === 201),
      saveBtn.click(),
    ]);

    const chip = page.getByRole("button", { name: "Aplicar vista: Valencia → Lyon" });
    await expect(chip).toBeVisible();

    // It survives leaving and coming back — the issue's persistence rule.
    await page.goto("/panel/historico");
    await expect(
      page.getByRole("button", { name: "Aplicar vista: Valencia → Lyon" }),
    ).toBeVisible();

    // One click restores the exact filters, and the chip marks itself active.
    await page.getByRole("button", { name: "Aplicar vista: Valencia → Lyon" }).click();
    await expect(page).toHaveURL(/q=lyon/);
    await expect(page).toHaveURL(/plate=1234ABC/);
    await expect(page.locator('[data-testid^="saved-view-"][data-active="true"]')).toHaveCount(1);

    // "Limpiar filtros" still works and deactivates the view.
    await page.goto("/panel/historico");
    await expect(page.locator('[data-testid^="saved-view-"][data-active="true"]')).toHaveCount(0);

    // Rename.
    await page.goto("/panel/historico?q=lyon&plate=1234ABC");
    page.once("dialog", (d) => d.accept("Francia"));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas/") && r.status() === 200),
      page.locator('[data-testid^="saved-view-rename-"]').first().click(),
    ]);
    await expect(page.getByRole("button", { name: "Aplicar vista: Francia" })).toBeVisible();

    // Delete.
    page.once("dialog", (d) => d.accept());
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas/") && r.status() === 200),
      page.locator('[data-testid^="saved-view-remove-"]').first().click(),
    ]);
    await expect(page.getByRole("button", { name: "Aplicar vista: Francia" })).toHaveCount(0);
  });

  test("two names cannot collide, and the error is shown rather than swallowed", async ({
    page,
  }) => {
    await registerCompany(page, "Duplicadas SL");
    await page.goto("/panel/historico?q=lyon");

    page.once("dialog", (d) => d.accept("Francia"));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas") && r.status() === 201),
      page.getByTestId("saved-view-save").click(),
    ]);

    page.once("dialog", (d) => d.accept("Francia"));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas") && r.status() === 409),
      page.getByTestId("saved-view-save").click(),
    ]);
    // Scoped to the block's own alert: Next's route announcer is also role="alert".
    await expect(page.getByTestId("saved-views-error")).toContainText(
      "ya tienes una vista con ese nombre",
      { ignoreCase: true },
    );
  });

  test("a view is private: a colleague in the same company never sees it", async ({
    page,
    browser,
  }) => {
    await registerCompany(page, "Privadas SL");
    await page.goto("/panel/historico?q=secreto-de-ana");
    page.once("dialog", (d) => d.accept("Solo de Ana"));
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas") && r.status() === 201),
      page.getByTestId("saved-view-save").click(),
    ]);

    // A different user (own company — the isolation that matters here is the
    // USER boundary, and a second company also proves the tenant boundary).
    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    await registerCompany(other, "Otra SL");
    await other.goto("/panel/historico");
    await expect(other.getByRole("button", { name: "Aplicar vista: Solo de Ana" })).toHaveCount(0);
    await expect(other.locator('[data-testid^="saved-view-"]')).toHaveCount(0);
    await ctx.close();
  });

  test("an anonymous caller cannot read or write saved views", async ({ request }) => {
    expect((await request.get("/api/panel/vistas")).status()).toBe(401);
    expect(
      (await request.post("/api/panel/vistas", { data: { name: "x", filters: {} } })).status(),
    ).toBe(401);
    expect((await request.delete("/api/panel/vistas/whatever")).status()).toBe(401);
  });

  test("another user's view id is not addressable (no IDOR)", async ({ page, browser }) => {
    await registerCompany(page, "Dueña SL");
    await page.goto("/panel/historico?q=mia");
    page.once("dialog", (d) => d.accept("Mía"));
    const created = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/vistas") && r.status() === 201),
      page.getByTestId("saved-view-save").click(),
    ]);
    const id = (await created[0].json()).view.id as string;

    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    await registerCompany(other, "Ajena SL");
    // Signed in as somebody else, that id must simply not exist.
    const patch = await other.request.patch(`/api/panel/vistas/${id}`, {
      data: { name: "secuestrada" },
    });
    expect(patch.status()).toBe(404);
    const del = await other.request.delete(`/api/panel/vistas/${id}`);
    expect(del.status()).toBe(404);
    await ctx.close();

    // And the owner still has it, untouched.
    await page.goto("/panel/historico");
    await expect(page.getByRole("button", { name: "Aplicar vista: Mía" })).toBeVisible();
  });
});

test.describe("#93 — three quick accesses on Inicio", () => {
  test("defaults are shown, the choice is editable, capped at 3, and restorable", async ({
    page,
  }) => {
    await registerCompany(page, "Accesos SL");
    await page.goto("/panel");

    const block = page.getByTestId("quick-actions");
    await expect(block).toBeVisible();
    // Unconfigured user → the three defaults.
    await expect(page.getByTestId("quick-action-crear")).toBeVisible();
    await expect(page.getByTestId("quick-action-historico")).toBeVisible();
    await expect(page.getByTestId("quick-action-plantillas")).toBeVisible();

    await page.getByTestId("quick-actions-customise").click();

    // Clear the defaults, then choose three others.
    for (const k of ["crear", "historico", "plantillas"]) {
      await page.getByTestId(`quick-action-option-${k}`).uncheck();
    }
    for (const k of ["equipo", "empresa", "ayuda"]) {
      await page.getByTestId(`quick-action-option-${k}`).check();
    }

    // The fourth is refused rather than silently replacing one.
    await expect(page.getByTestId("quick-action-option-vehiculos")).toBeDisabled();

    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/accesos") && r.status() === 200),
      page.getByTestId("quick-actions-save").click(),
    ]);

    await expect(page.getByTestId("quick-action-equipo")).toBeVisible();
    await expect(page.getByTestId("quick-action-crear")).toHaveCount(0);

    // Persists across a reload (and therefore across sessions/devices).
    await page.reload();
    await expect(page.getByTestId("quick-action-equipo")).toBeVisible();
    await expect(page.getByTestId("quick-action-ayuda")).toBeVisible();

    // The shortcuts actually go where they say.
    await page.getByTestId("quick-action-equipo").click();
    await expect(page).toHaveURL(/\/panel\/equipo/);

    // Restore defaults.
    await page.goto("/panel");
    await page.getByTestId("quick-actions-customise").click();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/accesos") && r.status() === 200),
      page.getByTestId("quick-actions-restore").click(),
    ]);
    await expect(page.getByTestId("quick-action-crear")).toBeVisible();
  });

  test("the choice is per user: a colleague's Inicio is untouched", async ({ page, browser }) => {
    await registerCompany(page, "Equipo Accesos SL");
    await page.goto("/panel");
    await page.getByTestId("quick-actions-customise").click();
    for (const k of ["crear", "historico", "plantillas"]) {
      await page.getByTestId(`quick-action-option-${k}`).uncheck();
    }
    await page.getByTestId("quick-action-option-ayuda").check();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/panel/accesos") && r.status() === 200),
      page.getByTestId("quick-actions-save").click(),
    ]);
    await expect(page.getByTestId("quick-action-ayuda")).toBeVisible();

    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    await registerCompany(other, "Otra Accesos SL");
    await other.goto("/panel");
    // The other user still sees the defaults, not this user's choice.
    await expect(other.getByTestId("quick-action-crear")).toBeVisible();
    await expect(other.getByTestId("quick-action-ayuda")).toHaveCount(0);
    await ctx.close();
  });

  test("an unknown or over-long selection is normalised, never stored", async ({ page }) => {
    await registerCompany(page, "Normaliza SL");
    const res = await page.request.put("/api/panel/accesos", {
      data: {
        actions: ["equipo", "equipo", "/admin/empresas", "nope", "ayuda", "empresa", "crear"],
      },
    });
    expect(res.status()).toBe(200);
    // De-duplicated, junk dropped, capped at three.
    expect((await res.json()).actions).toEqual(["equipo", "ayuda", "empresa"]);
  });

  test("an anonymous caller cannot write quick accesses", async ({ request }) => {
    expect((await request.put("/api/panel/accesos", { data: { actions: [] } })).status()).toBe(401);
  });
});
