import { test, expect, type Page } from "@playwright/test";

/**
 * #78 — a one-click star pins a saved record to the top of its list (and, by
 * the same ordering, the wizard dropdowns). Company-scoped, reversible,
 * creates no duplicate.
 */
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

async function register(page: Page) {
  await page.goto("/registro");
  await page.fill("#email", `fav${rnd()}@example.com`);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", `Favoritos SL ${rnd()}`);
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
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

function vehiclePanel(page: Page) {
  return page.locator("#panel-vehicle");
}

async function addVehicle(page: Page, alias: string, plate: string) {
  await page.getByTestId("add-vehicle").click();
  await page.fill("#v-alias", alias);
  await page.fill("#v-tractor", plate);
  await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
  // #86 p3 — alias stored uppercase
  await expect(
    vehiclePanel(page).locator("ul > li").filter({ hasText: alias.toUpperCase() }),
  ).toBeVisible();
}

test("starring a saved vehicle floats it to the top and is reversible; no duplicate", async ({
  page,
}) => {
  await register(page);
  await page.goto("/panel/datos");
  await page.getByTestId("tab-vehicle").click();

  await addVehicle(page, "Camion Uno", "1111AAA");
  await addVehicle(page, "Camion Dos", "2222BBB"); // newest → currently first

  const list = vehiclePanel(page).locator("ul > li");
  await expect(list).toHaveCount(2);
  await expect(list.first()).toContainText("CAMION DOS");

  // star the older one
  await list.filter({ hasText: "CAMION UNO" }).getByTestId("favorite-star").click();
  await expect(list).toHaveCount(2); // no duplicate
  await expect(list.first()).toContainText("CAMION UNO");

  // un-star → order reverts
  await list.first().getByTestId("favorite-star").click();
  await expect(list.first()).toContainText("CAMION DOS");
});
