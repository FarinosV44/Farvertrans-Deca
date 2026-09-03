import { test, expect, type Page } from "@playwright/test";

const DECA = {
  shipper: { name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120, Valencia" },
  carrier: { name: "Transportes Pérez SL", nif: "B12345674" },
  origin: "Valencia",
  destination: "Madrid",
  transportDate: "2026-10-06",
  goods: "Palés de cerámica",
  weight: "12000 kg",
  tractorPlate: "1234 BCD",
};

function email() {
  return `w${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

/** Register a fresh company and return the logged-in page on /app. */
async function registerCompany(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Mi Transporte SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/app$/);
}

async function createDecaAuthed(page: Page) {
  await page.goto("/crear");
  await page.fill("#shipperName", DECA.shipper.name);
  await page.fill("#shipperNif", DECA.shipper.nif);
  await page.fill("#shipperAddress", DECA.shipper.address);
  await page.fill("#carrierName", DECA.carrier.name);
  await page.fill("#carrierNif", DECA.carrier.nif);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", DECA.origin);
  await page.fill("#destination", DECA.destination);
  await page.fill("#transportDate", DECA.transportDate);
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", DECA.goods);
  await page.fill("#weight", DECA.weight);
  await page.fill("#tractorPlate", DECA.tractorPlate);
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
}

test.describe("BUILD 10 — registered workspace", () => {
  test("a created DeCA appears in the workspace and the history", async ({ page }) => {
    await registerCompany(page);
    await createDecaAuthed(page);

    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Últimos documentos" })).toBeVisible();
    await expect(page.getByText("Valencia → Madrid").first()).toBeVisible();

    await page.goto("/app/historico");
    await expect(page.getByText("1 documento")).toBeVisible();
    // search filters
    await page.fill("#q", "madrid");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page.getByText("1 documento")).toBeVisible();
    await page.fill("#q", "barcelona");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page.getByText("0 documentos")).toBeVisible();
  });

  test("Repetir último DeCA pre-fills a new document, date reset, new id on generate", async ({ page }) => {
    await registerCompany(page);
    await createDecaAuthed(page);
    const firstUrl = page.url();

    await page.goto("/app");
    await page.getByTestId("app-repetir").click();
    await expect(page).toHaveURL(/\/crear\?from=/);
    await expect(page.locator("#shipperName")).toHaveValue(DECA.shipper.name);
    await expect(page.locator("#carrierNif")).toHaveValue(DECA.carrier.nif);

    await page.getByTestId("wizard-next").click();
    await expect(page.locator("#transportDate")).toHaveValue(""); // reset
    await page.fill("#transportDate", "2026-10-20");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-generate").click();
    await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
    expect(page.url()).not.toBe(firstUrl); // brand-new document

    await page.goto("/app/historico");
    await expect(page.getByText("2 documentos")).toBeVisible();
  });

  test("saved data: add, autofill in the wizard, delete — and a generated DeCA is untouched", async ({
    page,
  }) => {
    await registerCompany(page);
    await createDecaAuthed(page);

    await page.goto("/app/datos");
    // add a saved company
    await page.getByText("Empresas / transportistas").scrollIntoViewIfNeeded();
    await page.locator("section", { hasText: "Empresas / transportistas" }).getByText("Añadir").click();
    await page.fill("#c-name", "Habitual Cargas SL");
    await page.fill("#c-nif", "B12345674");
    await page.locator("section", { hasText: "Empresas / transportistas" }).getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Habitual Cargas SL")).toBeVisible();

    // add a saved vehicle
    await page.locator("section", { hasText: "Vehículos" }).getByText("Añadir").click();
    await page.fill("#v-tractor", "5555 XYZ");
    await page.locator("section", { hasText: "Vehículos" }).getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("5555XYZ")).toBeVisible();

    // autofill in the wizard
    await page.goto("/crear");
    await page.getByTestId("autofill-company").selectOption({ label: "Habitual Cargas SL — B12345674" });
    await expect(page.locator("#carrierName")).toHaveValue("Habitual Cargas SL");
    await page.fill("#shipperName", DECA.shipper.name);
    await page.fill("#shipperNif", DECA.shipper.nif);
    await page.fill("#shipperAddress", DECA.shipper.address);
    await page.getByTestId("wizard-next").click();
    await page.fill("#origin", DECA.origin);
    await page.fill("#destination", DECA.destination);
    await page.fill("#transportDate", DECA.transportDate);
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("autofill-vehicle").selectOption({ label: "5555XYZ" });
    await expect(page.locator("#tractorPlate")).toHaveValue("5555XYZ");

    // delete the saved company — the earlier generated DeCA still shows its original carrier
    await page.goto("/app/datos");
    await page.locator("li", { hasText: "Habitual Cargas SL" }).getByRole("button", { name: "Borrar" }).click();
    await expect(page.getByText("Habitual Cargas SL")).toHaveCount(0);
    await page.goto("/app/historico");
    await expect(page.getByText("Transportes Pérez SL").first()).toBeVisible();
  });

  test("a11y: /app, /app/historico and /app/datos have no serious/critical violations", async ({
    page,
  }) => {
    const AxeBuilder = (await import("@axe-core/playwright")).default;
    await registerCompany(page);
    for (const path of ["/app", "/app/historico", "/app/datos"]) {
      await page.goto(path);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
      const bad = r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
      expect(bad.map((v) => `${path} ${v.id}`)).toEqual([]);
    }
  });
});
