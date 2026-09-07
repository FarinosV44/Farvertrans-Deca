import { test, expect } from "@playwright/test";

/**
 * #59 — a self-registering company must give a complete, well-formed ficha:
 * razón social, CIF/NIF (valid control character), persona de contacto,
 * teléfono, correo, dirección, código postal, población. The negative cases
 * are checked at the API (the server contract); the form is checked for the
 * fields being present and required.
 */

function email() {
  return `reg59${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

const API_FICHA: Record<string, string> = {
  companyName: "Transportes Registro SL",
  companyNif: "B12345674",
  companyContactName: "Ana Ejemplo",
  companyPhone: "600111222",
  companyEmail: "empresa@example.com",
  companyAddress: "Calle Prueba 1",
  companyPostalCode: "46540",
  companyCity: "El Puig",
};

test.describe("#59 — mandatory company ficha at registration", () => {
  test("a complete, valid ficha registers successfully", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { email: email(), password: "Supersecret123!", acceptTerms: true, ...API_FICHA },
    });
    expect(res.status()).toBe(201);
  });

  for (const field of [
    "companyContactName",
    "companyPhone",
    "companyEmail",
    "companyAddress",
    "companyPostalCode",
    "companyCity",
  ]) {
    test(`registration is refused when ${field} is missing`, async ({ request }) => {
      const data: Record<string, unknown> = {
        email: email(),
        password: "Supersecret123!",
        acceptTerms: true,
        ...API_FICHA,
      };
      delete data[field];
      const res = await request.post("/api/auth/register", { data });
      expect(res.status()).not.toBe(201);
      expect((await res.json()).error.code).toBe("bad_input");
    });
  }

  test("an invalid CIF control character is rejected (not just warned)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: email(),
        password: "Supersecret123!",
        acceptTerms: true,
        ...API_FICHA,
        companyNif: "B12345675", // control should be 4
      },
    });
    expect(res.status()).not.toBe(201);
    expect((await res.json()).error.message).toMatch(/CIF|NIF/i);
  });

  test("an invalid postal code is rejected", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: email(),
        password: "Supersecret123!",
        acceptTerms: true,
        ...API_FICHA,
        companyPostalCode: "99999",
      },
    });
    expect(res.status()).not.toBe(201);
  });

  test("the form exposes every mandatory company field, all required", async ({ page }) => {
    await page.goto("/registro");
    for (const id of [
      "companyName",
      "companyNif",
      "companyContactName",
      "companyPhone",
      "companyEmail",
      "companyAddress",
      "companyPostalCode",
      "companyCity",
    ]) {
      const field = page.locator(`#${id}`);
      await expect(field).toBeVisible();
      await expect(field).toHaveAttribute("required", "");
    }
  });
});
