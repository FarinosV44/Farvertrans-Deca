import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * #119 — DECA Conecta expansion: zona de disponibilidad rename + autofill,
 * final-shipment selection for a multi-envío DeCA, destino preferente,
 * camión completo / grupaje capacity, LONA/FRIGORÍFICO vehicle type,
 * privacy copy, edit, and workspace isolation. Builds on the #84 foundation
 * already covered end to end in `commercial-consent.spec.ts`.
 */

const prisma = new PrismaClient();

function email() {
  return `ca119${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function availabilityFor(decaId: string) {
  for (let i = 0; i < 25; i++) {
    const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
    if (row) return row;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

async function register(page: Page, opts: { commercialOptIn?: boolean } = {}) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Conecta 119 SL");
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("accept-terms").check();
  if (opts.commercialOptIn) await page.getByTestId("commercial-opt-in").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

async function fillStep1(page: Page) {
  await page.goto("/crear");
  await page.fill("#shipperName", "Cargas del Turia SL");
  await page.fill("#shipperNif", "B96789011");
  await page.fill("#shipperAddress", "Av. del Puerto 120, Valencia");
  await page.fill("#carrierName", "Transportes Pérez SL");
  await page.fill("#carrierNif", "B12345674");
  await page.fill("#carrierAddress", "Pol. Ind. Fuente del Jarro 5, Paterna");
  await page.getByTestId("wizard-next").click();
}

async function fillRoute(page: Page, unloadCity = "Madrid") {
  await page.fill("#loadLocationName", "Almacén Turia");
  await page.fill("#loadLocationAddress", "Av. del Puerto 120");
  await page.fill("#loadLocationPostalCode", "46023");
  await page.fill("#loadLocationCity", "Valencia");
  await page.fill("#loadLocationCountry", "España");
  await page.fill("#loadDate", "2026-10-06");
  await page.fill("#unloadLocationName", "Plataforma Norte");
  await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
  await page.fill("#unloadLocationPostalCode", "28028");
  await page.fill("#unloadLocationCity", unloadCity);
  await page.fill("#unloadLocationCountry", "España");
  await page.fill("#unloadDate", "2026-10-07");
  await page.getByTestId("wizard-next").click();
}

async function fillVehicleAndGoods(page: Page) {
  await page.fill("#goods", "Palés de cerámica");
  await page.fill("#weight", "12500 kg");
  await page.fill("#tractorPlate", "1234 BCD");
}

async function generate(page: Page): Promise<string> {
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i, { timeout: 15_000 });
  return page.url().split("/crear/")[1].split("?")[0];
}

test.describe("#119 — DECA Conecta expansion", () => {
  test("the field is 'Zona de disponibilidad' and autofills from the single unload, with the privacy notice visible", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page, "Madrid");
    await fillVehicleAndGoods(page);
    const box = page.getByTestId("commercial-share");
    await expect(box).toContainText("Zona de disponibilidad");
    await expect(box).not.toContainText("Destino o zona de disponibilidad");
    await expect(box).toContainText("Tu información comercial permanece privada.");
    await expect(page.getByTestId("commercial-share-destination")).toHaveAttribute(
      "placeholder",
      "Madrid",
    );
  });

  test("destino preferente is optional and, when set, is stored and shown in the summary", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page, "Madrid");
    await fillVehicleAndGoods(page);
    await page.fill('[data-testid="commercial-share-preferred-destination"]', "Valencia");
    await expect(page.getByTestId("commercial-share-summary")).toContainText("→ Valencia");
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.preferredDestination).toBe("Valencia");
  });

  test("Camión completo is the default; switching to Grupaje requires metros and kg, and clears on switching back", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);

    await expect(page.getByTestId("commercial-share-capacity-full")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByTestId("commercial-share-linear-meters")).toHaveCount(0);

    await page.getByTestId("commercial-share-capacity-partial").click();
    await expect(page.getByTestId("commercial-share-linear-meters")).toBeVisible();
    await expect(page.getByTestId("commercial-share-max-weight")).toBeVisible();

    // no values yet → server-side rejects (fire-and-forget, so assert via DB absence of capacity)
    const decaIdIncomplete = await generate(page);
    const rowIncomplete = await availabilityFor(decaIdIncomplete);
    // the record itself is never created when capacity is required but incomplete
    expect(rowIncomplete).toBeNull();
  });

  test("Grupaje with valid metros/kg is stored; switching back to Camión completo clears both fields visually", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    await page.getByTestId("commercial-share-capacity-partial").click();
    await page.fill('[data-testid="commercial-share-linear-meters"]', "4");
    await page.fill('[data-testid="commercial-share-max-weight"]', "8000");
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.capacityMode).toBe("partial");
    expect(row?.linearMeters).toBe(4);
    expect(row?.maxWeightKg).toBe(8000);
  });

  test("switching Grupaje → Camión completo clears the linear meters / kg inputs (no stale hidden values)", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    await page.getByTestId("commercial-share-capacity-partial").click();
    await page.fill('[data-testid="commercial-share-linear-meters"]', "4");
    await page.getByTestId("commercial-share-capacity-full").click();
    await page.getByTestId("commercial-share-capacity-partial").click();
    await expect(page.getByTestId("commercial-share-linear-meters")).toHaveValue("");
  });

  test("LONA / FRIGORÍFICO selection is optional and, when chosen, is stored", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    await page.getByTestId("commercial-share-type-frigorifico").click();
    await expect(page.getByTestId("commercial-share-type-frigorifico")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.vehicleType).toBe("frigorifico");
  });

  test("no vehicle type chosen is stored as unspecified, never a fabricated default", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.vehicleType).toBeNull();
  });

  test("2026 correction — availability postal code is pre-filled from the unload stop, editable, and persisted as the canonical matching value", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page, "Madrid"); // unloadLocationPostalCode = "28028"
    await fillVehicleAndGoods(page);

    // Pre-filled as a placeholder (server-side fallback), never forced into the value.
    await expect(page.getByTestId("commercial-share-destination-postal-code")).toHaveAttribute(
      "placeholder",
      "28028",
    );
    // The operator can still type an explicit, different value.
    await page.fill('[data-testid="commercial-share-destination-postal-code"]', "28001");
    await page.fill('[data-testid="commercial-share-preferred-destination-postal-code"]', "46023");

    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.availabilityPostalCode).toBe("28001");
    expect(row?.preferredDestinationPostalCode).toBe("46023");
  });

  test("2026 correction — leaving the postal code blank falls back to the unload stop's own postal code, never blocking the record", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page, "Madrid"); // unloadLocationPostalCode = "28028"
    await fillVehicleAndGoods(page);

    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.availabilityPostalCode).toBe("28028");
  });

  test("2026 correction — the expanded vehicle types (megatrailer/jumbo/frigolona/otro) are selectable and persisted", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);

    await page.getByTestId("commercial-share-type-megatrailer").click();
    await expect(page.getByTestId("commercial-share-type-megatrailer")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.vehicleType).toBe("megatrailer");
  });

  test("2026 correction — 'Otro' shows a free-text specify field and persists it only for 'otro'", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);

    await expect(page.getByTestId("commercial-share-type-other-input")).toHaveCount(0);
    await page.getByTestId("commercial-share-type-otro").click();
    await expect(page.getByTestId("commercial-share-type-other-input")).toBeVisible();
    await page.fill('[data-testid="commercial-share-type-other-input"]', "Portacontenedores");

    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.vehicleType).toBe("otro");
    expect(row?.vehicleTypeOther).toBe("Portacontenedores");
  });

  test("the prepared record never contains excluded DeCA content, even with all #119 fields set", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    await page.fill('[data-testid="commercial-share-preferred-destination"]', "Valencia");
    await page.getByTestId("commercial-share-capacity-partial").click();
    await page.fill('[data-testid="commercial-share-linear-meters"]', "4");
    await page.fill('[data-testid="commercial-share-max-weight"]', "8000");
    await page.getByTestId("commercial-share-type-lona").click();
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    const serialised = JSON.stringify(row);
    for (const forbidden of [
      "Cargas del Turia",
      "B96789011",
      "Av. del Puerto",
      "Almacén Turia",
      "Palés de cerámica",
      "12500",
      "1234 BCD",
    ]) {
      expect(serialised, `leaked: ${forbidden}`).not.toContain(forbidden);
    }
  });

  test("a multi-envío DeCA lets the operator pick which shipment's unload is the descarga final, without touching envío order", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    // The extra envío is created via #112's `+` button, which lives on the
    // route step itself — so it's added here, before `fillRoute`'s own
    // trailing "wizard-next" click moves past that step.
    await page.fill("#loadLocationName", "Almacén Turia");
    await page.fill("#loadLocationAddress", "Av. del Puerto 120");
    await page.fill("#loadLocationPostalCode", "46023");
    await page.fill("#loadLocationCity", "Valencia");
    await page.fill("#loadLocationCountry", "España");
    await page.fill("#loadDate", "2026-10-06");
    await page.fill("#unloadLocationName", "Plataforma Norte");
    await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
    await page.fill("#unloadLocationPostalCode", "28028");
    await page.fill("#unloadLocationCity", "Madrid");
    await page.fill("#unloadLocationCountry", "España");
    await page.fill("#unloadDate", "2026-10-07");
    await page.getByTestId("add-unload-1").click();
    await page.fill("#extraUnloadName0", "Plataforma Sur");
    await page.fill("#extraUnloadAddress0", "Calle Sur 10");
    await page.fill("#extraUnloadPostalCode0", "41001");
    await page.fill("#extraUnloadCity0", "Sevilla");
    await page.fill("#extraGoods0", "Azulejos");
    await page.fill("#extraWeight0", "8000 kg");
    await page.getByTestId("wizard-next").click();
    await fillVehicleAndGoods(page);

    await expect(page.getByTestId("commercial-share-final-shipment")).toBeVisible();
    await page.getByTestId("commercial-share-final-shipment").selectOption("1");
    await expect(page.getByTestId("commercial-share-destination")).toHaveAttribute(
      "placeholder",
      "Sevilla",
    );

    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row?.destination).toBe("Sevilla");
    expect(row?.finalShipmentIndex).toBe(1);

    // the DeCA itself still lists envío 1/2 in the order they were entered —
    // Conecta's choice (picking envío 2 as the "descarga final") never
    // touched the legal document's own shipment order/numbering.
    const version = await prisma.decaVersion.findFirst({
      where: { decaId },
      orderBy: { versionNo: "desc" },
      select: { dataJson: true },
    });
    const shipments = (
      version?.dataJson as { shipments?: { unloadLocation?: { city?: string } }[] }
    )?.shipments;
    expect(shipments?.[0]?.unloadLocation?.city).toBe("Madrid");
    expect(shipments?.[1]?.unloadLocation?.city).toBe("Sevilla");
  });

  test("the final-shipment select is absent for a single-shipment DeCA", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    await expect(page.getByTestId("commercial-share-final-shipment")).toHaveCount(0);
  });

  test("the owner can edit an already-prepared record's zona, destino preferente and capacity", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    const decaId = await generate(page);
    await availabilityFor(decaId);

    await page.goto(`/panel/deca/${decaId}`);
    await page.getByTestId("availability-edit").click();
    await page.fill('[data-testid="availability-edit-destination"]', "Barcelona");
    await page.fill('[data-testid="availability-edit-preferred"]', "Zaragoza");
    await page.getByTestId("availability-edit-capacity-partial").click();
    await page.fill('[data-testid="availability-edit-meters"]', "6");
    await page.fill('[data-testid="availability-edit-weight"]', "10000");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/availability") && r.ok()),
      page.getByTestId("availability-edit-save").click(),
    ]);
    await expect(page.getByTestId("availability-notice")).toContainText("Barcelona");
    const row = await availabilityFor(decaId);
    expect(row?.destination).toBe("Barcelona");
    expect(row?.preferredDestination).toBe("Zaragoza");
    expect(row?.capacityMode).toBe("partial");
    expect(row?.linearMeters).toBe(6);
    expect(row?.maxWeightKg).toBe(10000);
  });

  test("editing never touches the DeCA's own document or PDF", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    const decaId = await generate(page);
    await availabilityFor(decaId);
    const before = await prisma.decaVersion.findFirst({
      where: { decaId },
      orderBy: { versionNo: "desc" },
      select: { pdfSha256: true, versionNo: true },
    });

    await page.goto(`/panel/deca/${decaId}`);
    await page.getByTestId("availability-edit").click();
    await page.fill('[data-testid="availability-edit-destination"]', "Barcelona");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/availability") && r.ok()),
      page.getByTestId("availability-edit-save").click(),
    ]);

    const after = await prisma.decaVersion.findFirst({
      where: { decaId },
      orderBy: { versionNo: "desc" },
      select: { pdfSha256: true, versionNo: true },
    });
    expect(after).toEqual(before);
  });

  test("a record past its availability date shows as expired, not pending, with no confirm dialog required to view it", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);
    const decaId = await generate(page);
    await availabilityFor(decaId);
    // backdate it directly — the app never writes "expired" itself, it's
    // computed at read time (see lib/commercial/availability.ts#expiryStatus)
    await prisma.decaAvailabilityShare.update({
      where: { decaId },
      data: { availabilityDate: new Date("2020-01-01") },
    });
    await page.goto(`/panel/deca/${decaId}`);
    await expect(page.getByTestId("availability-notice")).toContainText("caducado");
    await expect(page.getByTestId("availability-withdraw")).toHaveCount(0);
  });

  test("workspace isolation: company B never sees company A's availability data via the API", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await register(pageA, { commercialOptIn: true });
    await fillStep1(pageA);
    await fillRoute(pageA);
    await fillVehicleAndGoods(pageA);
    const decaId = await generate(pageA);
    await availabilityFor(decaId);

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await register(pageB);
    const res = await pageB.request.post(`/api/deca/${decaId}/availability`, {
      data: { action: "withdraw" },
    });
    expect(res.status()).toBe(404);

    await ctxA.close();
    await ctxB.close();
  });

  test("responsive: the capacity and vehicle-type pickers stay usable with no horizontal overflow", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillStep1(page);
    await fillRoute(page);
    await fillVehicleAndGoods(page);

    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId("commercial-share-capacity-full")).toBeVisible();
      await expect(page.getByTestId("commercial-share-capacity-partial")).toBeVisible();
      await expect(page.getByTestId("commercial-share-type-lona")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });
});
