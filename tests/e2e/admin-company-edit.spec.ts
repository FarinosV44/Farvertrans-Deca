import { test, expect, request as pwRequest } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { ADMIN, adminTotpCode, loginAdminApi, internalPage } from "./helpers/admin-auth";

/**
 * Superadmin company-name/CIF-NIF correction (customer-support use case: a
 * customer registered the company incorrectly). Builds on the existing #62
 * ficha editor (`CompanyEditForm` / `PATCH /api/admin/empresas/[id]` action
 * "edit") — this file covers the NEW parts: the duplicate-CIF/NIF warning
 * (never a hard block, per the pre-existing D-162 "warn, don't block"
 * philosophy for this exact case) and the audit trail now carrying the
 * actual old→new values.
 */

const prisma = new PrismaClient();
test.afterAll(() => prisma.$disconnect());

function email() {
  return `ce${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}
/** A unique-per-run, foreign-shaped tax id — valid per `isValidOwnNif()`'s
 *  "unrecognised shape but plausible" rule, and guaranteed not to collide
 *  with the "B12345674" constant dozens of OTHER e2e specs reuse. */
function uniqueNif() {
  return `TESTNIF${Date.now().toString().slice(-8)}`;
}

const FICHA = {
  companyName: "Ficha Corregible SL",
  companyNif: "B12345674",
  companyContactName: "Ana Ejemplo",
  companyPhone: "600111222",
  companyEmail: "empresa@example.com",
  companyAddress: "Calle Prueba 1",
  companyPostalCode: "46540",
  companyCity: "El Puig",
};

async function newCompany() {
  const ctx = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  const addr = email();
  const reg = await ctx.post("/api/auth/register", {
    data: { email: addr, password: "Supersecret123!", acceptTerms: true, ...FICHA },
  });
  expect(reg.status()).toBe(201);
  await ctx.get(`/verificar-email/${(await reg.json()).verifyTestToken}`);
  const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });
  return { ctx, addr, companyId: user.companyId! };
}

const editData = (over: Partial<Record<string, string>> = {}) => ({
  name: "Ficha Corregible SL",
  nif: uniqueNif(),
  contactName: "Ana Ejemplo",
  phone: "600111222",
  email: "empresa@example.com",
  address: "Calle Prueba 1",
  postalCode: "46540",
  city: "El Puig",
  ...over,
});

test("superadmin can correct the company's razón social and CIF/NIF; the workspace id and existing data survive", async ({
  request,
}) => {
  const { ctx, companyId } = await newCompany();
  const before = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  const newNif = uniqueNif();
  await loginAdminApi(request);

  const res = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: editData({ name: "Cargas Corregidas SL", nif: newNif }) },
  });
  expect(res.status()).toBe(200);

  const after = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(after.id).toBe(before.id); // same workspace, never a new company
  expect(after.name).toBe("Cargas Corregidas SL");
  expect(after.nif).toBe(newNif);

  // The company's own session is completely unaffected by the correction.
  const stillIn = await ctx.get("/panel/historico");
  expect(stillIn.status()).toBe(200);
  await ctx.dispose();
});

test("a normal (non-internal) user cannot reach the edit action", async () => {
  const { ctx, companyId } = await newCompany();
  const res = await ctx.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: editData() },
  });
  expect(res.status()).toBe(404); // the admin area doesn't exist for them
  await ctx.dispose();
});

test("changing the CIF/NIF to one already used by another ACTIVE company is warned, not silently allowed", async ({
  request,
}) => {
  const { companyId: companyA } = await newCompany();
  const { companyId: companyB } = await newCompany();
  const sharedNif = uniqueNif();
  await loginAdminApi(request);

  // Give company A the NIF first.
  const first = await request.patch(`/api/admin/empresas/${companyA}`, {
    data: { action: "edit", data: editData({ nif: sharedNif }) },
  });
  expect(first.status()).toBe(200);

  // Company B tries to take the same NIF — warned, not applied.
  const warned = await request.patch(`/api/admin/empresas/${companyB}`, {
    data: { action: "edit", data: editData({ name: "Otra empresa SL", nif: sharedNif }) },
  });
  expect(warned.status()).toBe(409);
  const body = await warned.json();
  expect(body.error.code).toBe("duplicate_nif");
  expect(body.error.conflictingCompanyName).toBe("Ficha Corregible SL");
  // never silently applied
  expect((await prisma.company.findUniqueOrThrow({ where: { id: companyB } })).nif).not.toBe(
    sharedNif,
  );

  // Confirming proceeds anyway — D-162's "warn, never hard-block" for a
  // duplicate NIF; a legitimate case exists (e.g. two workspaces for one
  // real legal entity) and the superadmin, not the system, decides.
  const confirmed = await request.patch(`/api/admin/empresas/${companyB}`, {
    data: {
      action: "edit",
      data: editData({ name: "Otra empresa SL", nif: sharedNif }),
      confirmDuplicateNif: true,
    },
  });
  expect(confirmed.status()).toBe(200);
  expect((await prisma.company.findUniqueOrThrow({ where: { id: companyB } })).nif).toBe(sharedNif);
});

test("editing WITHOUT changing the CIF/NIF never triggers the duplicate check, even if the value is common", async ({
  request,
}) => {
  const { companyId } = await newCompany(); // registers with the shared "B12345674" fixture NIF
  await loginAdminApi(request);
  const res = await request.patch(`/api/admin/empresas/${companyId}`, {
    // same nif as already stored (companyNif in FICHA) — only the name changes
    data: { action: "edit", data: editData({ name: "Solo cambio el nombre", nif: "B12345674" }) },
  });
  expect(res.status()).toBe(200);
});

test("the audit log records the old and new name/CIF-NIF for the change, with the actor and timestamp", async ({
  request,
}) => {
  const { companyId } = await newCompany();
  const newNif = uniqueNif();
  await loginAdminApi(request);

  const before = new Date();
  const res = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: editData({ name: "Nombre Nuevo SL", nif: newNif }) },
  });
  expect(res.status()).toBe(200);

  const entry = await prisma.securityAuditLog.findFirst({
    where: { action: "admin_edited_company", targetId: companyId },
    orderBy: { createdAt: "desc" },
  });
  expect(entry).not.toBeNull();
  expect(entry!.detail).toContain("Nombre Nuevo SL");
  expect(entry!.detail).toContain(newNif);
  expect(entry!.actorId).not.toBeNull();
  expect(entry!.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
});

test("editing with no name/NIF change records no detail (nothing worth noting)", async ({
  request,
}) => {
  const { companyId } = await newCompany();
  await loginAdminApi(request);
  await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: editData({ name: FICHA.companyName, nif: "B12345674" }) },
  });
  const entry = await prisma.securityAuditLog.findFirst({
    where: { action: "admin_edited_company", targetId: companyId },
    orderBy: { createdAt: "desc" },
  });
  expect(entry?.detail ?? null).toBeNull();
});

test("UI: changing the CIF/NIF prompts a client-side confirm, and declining the server's duplicate warning shows it on screen", async ({
  browser,
}) => {
  const { companyId: companyA } = await newCompany();
  const { companyId: companyB } = await newCompany();
  const sharedNif = uniqueNif();
  await prisma.company.update({ where: { id: companyA }, data: { nif: sharedNif } });

  const { page, close } = await internalPage(browser);
  try {
    await page.goto(`/admin/empresas/${companyB}`);
    await page.getByText("Editar ficha de la empresa").click();
    await page.fill('[data-testid="company-edit-nif"]', sharedNif);

    const messages: string[] = [];
    // 1st dialog: the client-side "sensitive identifier" confirm — accept it
    // so the request actually reaches the server.
    page.once("dialog", (d) => {
      messages.push(d.message());
      d.accept();
    });
    await page.getByTestId("company-edit-save").click();

    // 2nd dialog: the server's duplicate-NIF warning — DECLINE it, so the
    // change is never applied and the message renders in the DOM instead.
    await page.waitForEvent("dialog").then(async (d) => {
      messages.push(d.message());
      await d.dismiss();
    });

    expect(messages[0]).toMatch(/identificador sensible/i);
    expect(messages[1]).toMatch(/Ya existe la empresa/);
    await expect(page.getByRole("alert").filter({ hasText: "Ya existe la empresa" })).toBeVisible();
    expect((await prisma.company.findUniqueOrThrow({ where: { id: companyB } })).nif).not.toBe(
      sharedNif,
    );
  } finally {
    await close();
  }
});

test("UI: cancelling discards unsaved edits back to the current values", async ({ browser }) => {
  const { companyId } = await newCompany();
  const { page, close } = await internalPage(browser);
  try {
    await page.goto(`/admin/empresas/${companyId}`);
    await page.getByText("Editar ficha de la empresa").click();
    await page.fill('[data-testid="company-edit-name"]', "Nombre a medio escribir");
    await page.getByTestId("company-edit-cancel").click();
    await expect(page.getByTestId("company-edit-name")).toHaveValue(FICHA.companyName);
  } finally {
    await close();
  }
});

test("the auditoría page shows the old→new detail for a company edit", async ({ browser }) => {
  const { companyId } = await newCompany();
  const newNif = uniqueNif();
  const api = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  await api.post("/api/auth/login", { data: ADMIN });
  await api.post("/api/admin/2fa/verify", { data: { code: adminTotpCode() } });
  await api.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: editData({ name: "Visible En Auditoría SL", nif: newNif }) },
  });
  await api.dispose();

  const { page, close } = await internalPage(browser);
  try {
    await page.goto("/admin/auditoria?action=admin_edited_company");
    await expect(page.getByText("Visible En Auditoría SL")).toBeVisible();
    await expect(page.getByText(newNif)).toBeVisible();
  } finally {
    await close();
  }
});
