import { test, expect, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { internalPage } from "./helpers/admin-auth";

/**
 * #87 / #88 — commercial intelligence in Super Admin.
 *
 * #87 `Oportunidades`: only carriers with an ACTIVE commercial consent appear,
 * with their observed route activity; the radar can be filtered by destination
 * and a manual follow-up state persists; the WhatsApp action is offered only
 * for the authorised channel.
 * #88: the company ficha shows a transparent "Afinidad Farvertrans" score with
 * its breakdown when eligible, and nothing derived when it is not.
 */

const prisma = new PrismaClient();
const rnd = () => `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

test.afterAll(async () => {
  await prisma.$disconnect();
});

async function registerVerified(request: APIRequestContext, companyName: string) {
  const email = `ci${rnd()}@example.com`;
  const res = await request.post("/api/auth/register", {
    data: {
      email,
      password: "Supersecret123!",
      companyName,
      companyNif: "B12345674",
      companyContactName: "Ana Ejemplo",
      companyPhone: "600111222",
      companyEmail: "empresa@example.com",
      companyAddress: "Calle Prueba 1",
      companyPostalCode: "46540",
      companyCity: "El Puig",
      acceptTerms: true,
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  await request.get(`/verificar-email/${body.verifyTestToken}`);
}

async function createDeca(
  request: APIRequestContext,
  unload: { city: string; province?: string; country: string },
  unloadDate: string,
) {
  const res = await request.post("/api/deca", {
    headers: { "idempotency-key": `ci-${rnd()}` },
    data: {
      shipper: { name: "Cargas del Turia SL", nif: "B96789011", address: "Av. del Puerto 120" },
      carrier: { name: "Transportes CI SL", nif: "B12345674", address: "Calle 5, Paterna" },
      loadLocation: {
        name: "Almacén Turia",
        address: "Av. del Puerto 120",
        postalCode: "46023",
        city: "Valencia",
        province: "Valencia",
        country: "España",
      },
      unloadLocation: {
        name: "Plataforma",
        address: "Calle 1",
        postalCode: "00000",
        city: unload.city,
        province: unload.province ?? "",
        country: unload.country,
      },
      loadDate: "2026-10-06",
      unloadDate,
      goods: "Palés de cerámica",
      weight: "12.500 kg",
      tractorPlate: "1234 BCD",
      trailerPlate: "",
      reference: "",
    },
  });
  expect(res.status(), await res.text()).toBe(201);
}

test("#87/#88: a consented carrier surfaces on the radar with a profile; a non-consented one does not", async ({
  browser,
}) => {
  const consented = `Radar Consentida SL ${rnd()}`;
  const silent = `Radar Silenciosa SL ${rnd()}`;

  // --- consented carrier: verified account, two DeCA to Lyon, consent + channel ---
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await registerVerified(a.request, consented);
  await createDeca(a.request, { city: "Lyon", country: "Francia" }, "2026-10-08");
  await createDeca(a.request, { city: "Lyon", country: "Francia" }, "2026-10-15");
  expect((await a.request.post("/api/company/consent", { data: { mode: "all" } })).status()).toBe(
    200,
  );
  expect(
    (
      await a.request.post("/api/company/consent", {
        data: { channel: "both", contactPhone: "600999888", contactEmail: "flota@radar.example" },
      })
    ).status(),
  ).toBe(200);

  // --- silent carrier: verified account, a DeCA, but NO consent ---
  const ctxB = await browser.newContext();
  const b = await ctxB.newPage();
  await registerVerified(b.request, silent);
  await createDeca(b.request, { city: "Lyon", country: "Francia" }, "2026-10-09");

  const companyIds = await prisma.company.findMany({
    where: { name: { in: [consented, silent] } },
    select: { id: true, name: true },
  });
  const consentedId = companyIds.find((c) => c.name === consented)!.id;
  const silentId = companyIds.find((c) => c.name === silent)!.id;

  const { page: admin, close } = await internalPage(browser);
  try {
    // ---- #87 radar ----
    await admin.goto("/admin/oportunidades");
    await expect(admin.getByRole("heading", { name: "Oportunidades" })).toBeVisible();

    const consentedRow = admin.getByRole("row", { name: new RegExp(consented) });
    await expect(consentedRow).toBeVisible();
    await expect(consentedRow).toContainText("Valencia → Lyon");
    await expect(consentedRow).toContainText("España ↔ Francia");
    // the non-consented carrier is never an opportunity
    await expect(admin.getByRole("row", { name: new RegExp(silent) })).toHaveCount(0);

    // WhatsApp action is offered (channel includes phone + a value)
    await expect(admin.getByTestId(`opp-whatsapp-${consentedId}`)).toBeVisible();

    // ---- filter by destination ----
    await admin.goto("/admin/oportunidades?destCity=Lyon");
    await expect(admin.getByRole("row", { name: new RegExp(consented) })).toBeVisible();
    await admin.goto("/admin/oportunidades?destCity=Madrid");
    await expect(admin.getByRole("row", { name: new RegExp(consented) })).toHaveCount(0);

    // ---- manual state persists ----
    await admin.goto("/admin/oportunidades");
    await admin.getByTestId(`opp-state-${consentedId}`).selectOption("contacted");
    await admin.waitForResponse(
      (r) => r.url().includes(`/api/admin/oportunidades/${consentedId}`) && r.status() === 200,
    );
    await admin.reload();
    await expect(admin.getByTestId(`opp-state-${consentedId}`)).toHaveValue("contacted");
    expect(
      await prisma.commercialOpportunity.findUnique({ where: { companyId: consentedId } }),
    ).toMatchObject({ state: "contacted" });

    // ---- #88 profile on the ficha ----
    await admin.goto(`/admin/empresas/${consentedId}`);
    await expect(admin.getByTestId("carrier-commercial-profile")).toBeVisible();
    await expect(admin.getByTestId("affinity-score")).toContainText("Afinidad Farvertrans:");
    await expect(admin.getByTestId("affinity-breakdown")).toContainText(
      "Coincide con un corredor de interés",
    );

    // ---- #88 privacy: no consent → no derived profile ----
    await admin.goto(`/admin/empresas/${silentId}`);
    await expect(admin.getByTestId("carrier-commercial-profile")).toHaveCount(0);
    await expect(admin.getByText("no tiene consentimiento comercial activo")).toBeVisible();

    // ---- the API refuses a follow-up state on a non-eligible company ----
    const refused = await admin.request.patch(`/api/admin/oportunidades/${silentId}`, {
      data: { state: "contacted" },
    });
    expect(refused.status()).toBe(409);

    // ---- #89 activity trail + conversion + KPIs ----
    const advance = await admin.request.patch(`/api/admin/oportunidades/${consentedId}`, {
      data: {
        state: "converted",
        channel: "whatsapp",
        note: "Nota de conversion e2e unica",
        outcome: {
          internalRef: "FV-2026-001",
          loadsGenerated: 3,
          revenueEur: 4500,
          marginEur: 600,
        },
      },
    });
    expect(advance.status()).toBe(200);

    const logs = await prisma.commercialActivityLog.findMany({ where: { companyId: consentedId } });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((l) => l.channel === "whatsapp" && l.toState === "converted")).toBe(true);
    const oppRow = await prisma.commercialOpportunity.findUnique({
      where: { companyId: consentedId },
    });
    expect(oppRow).toMatchObject({
      state: "converted",
      internalRef: "FV-2026-001",
      loadsGenerated: 3,
      revenueEur: 4500,
    });
    expect(oppRow!.convertedByUserId).toBeTruthy();

    await admin.goto("/admin/comercial");
    await expect(admin.getByRole("heading", { name: "Panel comercial" })).toBeVisible();
    await expect(admin.getByText("Facturación atribuida")).toBeVisible();
    await expect(admin.getByRole("row", { name: new RegExp(consented) }).first()).toBeVisible();
    await expect(admin.getByText("Nota de conversion e2e unica").first()).toBeVisible();

    // the #88 ficha now shows the commercial history
    await admin.goto(`/admin/empresas/${consentedId}`);
    await expect(admin.getByTestId("carrier-commercial-activity")).toBeVisible();

    // ---- #90 alert centre ----
    await admin.request.post("/api/admin/alertas-comerciales/config", {
      data: { minMovements: 2, priorityCorridors: ["es-francia"] },
    });
    await admin.goto("/admin/alertas-comerciales");
    await expect(admin.getByRole("heading", { name: "Alertas comerciales" })).toBeVisible();
    const alertRows = admin.getByRole("row", { name: new RegExp(consented) });
    expect(await alertRows.count()).toBeGreaterThan(0);
    for (let guard = 0; guard < 12 && (await alertRows.count()) > 0; guard++) {
      await alertRows.first().getByRole("button", { name: "Descartar" }).click();
      await admin.waitForResponse(
        (r) =>
          r.url().includes("/api/admin/alertas-comerciales/") && r.request().method() === "PATCH",
      );
      await admin.waitForTimeout(300);
    }
    // dismissed alerts stay dismissed on the next recompute (reload re-runs refreshAlerts)
    await admin.reload();
    await expect(admin.getByRole("row", { name: new RegExp(consented) })).toHaveCount(0);
  } finally {
    await close();
    await ctxA.close();
    await ctxB.close();
  }
});

test("#87: the radar API is invisible to a non-internal caller", async ({ request }) => {
  const res = await request.patch("/api/admin/oportunidades/whatever", {
    data: { state: "contacted" },
  });
  expect(res.status()).toBe(404);
});
