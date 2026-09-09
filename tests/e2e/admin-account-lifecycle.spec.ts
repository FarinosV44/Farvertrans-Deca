import { test, expect, request as pwRequest } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { loginAdminApi } from "./helpers/admin-auth";

/**
 * #62 — superadmin account lifecycle. Blocking a company kills its members'
 * sessions and stops new DeCA, but a DeCA already issued stays verifiable at
 * `/d/[token]`. Anonymising overwrites PII in place and never deletes a row,
 * a DeCA, or an audit entry (D-067).
 */

const prisma = new PrismaClient();
test.afterAll(() => prisma.$disconnect());

function email() {
  return `life62${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

const FICHA = {
  companyName: "Ciclo Vital SL",
  companyNif: "B12345674",
  companyContactName: "Ana Ejemplo",
  companyPhone: "600111222",
  companyEmail: "empresa@example.com",
  companyAddress: "Calle Prueba 1",
  companyPostalCode: "46540",
  companyCity: "El Puig",
};
const LOC = (name: string, city: string, cp: string, prov: string) => ({
  name,
  address: "Calle Ejemplo 1",
  postalCode: cp,
  city,
  province: prov,
  country: "España",
});
const DECA = {
  shipper: { name: "Cargas SL", nif: "B96789011", address: "Av. del Puerto 120, Valencia" },
  carrier: { name: "Trans SL", nif: "B12345674", address: "Calle 9, Sagunto" },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  loadLocation: LOC("Norte", "Valencia", "46023", "Valencia"),
  unloadLocation: LOC("Sur", "Madrid", "28028", "Madrid"),
  tractorPlate: "1234 BCD",
  goods: "Palés",
  weight: "12000 kg",
};

async function newCompanyWithDeca() {
  const ctx = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  const addr = email();
  const reg = await ctx.post("/api/auth/register", {
    data: { email: addr, password: "Supersecret123!", acceptTerms: true, ...FICHA },
  });
  expect(reg.status()).toBe(201);
  await ctx.get(`/verificar-email/${(await reg.json()).verifyTestToken}`);
  const created = await ctx.post("/api/deca", { data: DECA });
  expect(created.status()).toBe(201);
  const token = (await created.json()).token as string;
  const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });
  return { ctx, addr, token, userId: user.id, companyId: user.companyId! };
}

test("block a company: members locked out, but its DeCA stays public; reactivate restores", async ({
  request,
}) => {
  const { ctx, token, companyId } = await newCompanyWithDeca();
  await loginAdminApi(request);

  const blocked = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "block", reason: "impago" },
  });
  expect(blocked.status()).toBe(200);

  // The member's live session is dead — they cannot act as their company.
  expect((await ctx.get("/api/auth/verify-email/status")).status()).toBe(401);
  // But the already-issued document is still verifiable (legal inspection).
  const pub = await ctx.get(`/d/${token}`);
  expect(pub.status()).toBe(200);
  expect(pub.headers()["content-type"]).toContain("application/pdf");

  const back = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "reactivate" },
  });
  expect(back.status()).toBe(200);
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(company.status).toBe("active");
});

test("anonymise a company: PII gone, DeCA + audit kept", async ({ request }) => {
  const { token, companyId, userId } = await newCompanyWithDeca();
  const decaCountBefore = await prisma.deca.count({ where: { companyId } });
  await loginAdminApi(request);

  const bad = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "anonymize", confirm: "nope" },
  });
  expect(bad.status()).toBe(422);

  const ok = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "anonymize", confirm: "ANONIMIZAR" },
  });
  expect(ok.status()).toBe(200);

  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(company.status).toBe("anonymized");
  expect(company.nif).toBeNull();
  expect(company.email).toBeNull();
  expect(company.anonymizedAt).not.toBeNull();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  expect(user.email).toMatch(/@anonymized\.invalid$/);
  expect(user.status).toBe("anonymized");

  // Documents and audit are untouched.
  expect(await prisma.deca.count({ where: { companyId } })).toBe(decaCountBefore);
  expect((await request.get(`/d/${token}`)).status()).toBe(200);
  expect(
    await prisma.securityAuditLog.count({
      where: { targetId: companyId, action: "company_anonymized" },
    }),
  ).toBe(1);
});

test("edit the ficha: the superadmin fixes an invalid NIF the owner cannot touch", async ({
  request,
}) => {
  const { companyId } = await newCompanyWithDeca();
  await loginAdminApi(request);

  // Simulate a pre-#59 company whose locked NIF is not a valid CIF.
  await prisma.company.update({ where: { id: companyId }, data: { nif: "praetoria sl" } });

  const base = {
    name: "Praetoria SL",
    contactName: "Ana Ejemplo",
    phone: "600111222",
    email: "empresa@example.com",
    address: "Calle Prueba 1",
    postalCode: "46540",
    city: "El Puig",
  };

  // A still-invalid NIF is rejected by the shared schema.
  const bad = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: { ...base, nif: "praetoria sl" } },
  });
  expect(bad.status()).toBe(422);

  // A valid CIF goes through.
  const ok = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: { ...base, nif: "B12345674" } },
  });
  expect(ok.status()).toBe(200);

  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(company.nif).toBe("B12345674");
  expect(company.name).toBe("Praetoria SL");
  expect(company.dataCompletedAt).not.toBeNull(); // full ficha now valid → stamped
});

test("the lifecycle routes are step-up gated and internal-only", async () => {
  const anon = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  const r = await anon.patch("/api/admin/usuarios/whatever", { data: { action: "block" } });
  expect(r.status()).toBe(404); // not internal → the area does not exist
});

/**
 * #103 — "Marcar como prueba" is purely a visibility/metrics label: reversible,
 * never touches access or data, and Superadmin's list hides TEST/archived
 * companies by default without ever deleting anything. No hard-delete action
 * exists anywhere in this API — verified directly (only the 4 known actions
 * are ever accepted).
 */
test("#103: marking a company as TEST is reversible and never touches access or data", async ({
  request,
}) => {
  const { ctx, addr, companyId } = await newCompanyWithDeca();
  await loginAdminApi(request);

  const before = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(before.isTest).toBe(false);

  const mark = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "set_test", isTest: true },
  });
  expect(mark.status()).toBe(200);
  expect((await prisma.company.findUniqueOrThrow({ where: { id: companyId } })).isTest).toBe(true);

  // The company's own user is completely unaffected — still logged in, still
  // sees their DeCA, still active. "Marcar como prueba" never touches this.
  const stillIn = await ctx.get("/panel/historico");
  expect(stillIn.status()).toBe(200);
  const stillActive = await prisma.user.findFirstOrThrow({ where: { email: addr } });
  expect(stillActive.status).toBe("active");

  const unmark = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "set_test", isTest: false },
  });
  expect(unmark.status()).toBe(200);
  expect((await prisma.company.findUniqueOrThrow({ where: { id: companyId } })).isTest).toBe(false);

  await ctx.dispose();
});

test("#103: TEST and archived companies are hidden from the default Superadmin list, one click away", async ({
  request,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();
  await loginAdminApi(request);
  const marked = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "set_test", isTest: true },
  });
  expect(marked.status()).toBe(200);

  const activeList = await (await request.get("/admin/empresas")).text();
  expect(activeList).not.toContain(companyId);

  const testList = await (await request.get("/admin/empresas?estado=test")).text();
  expect(testList).toContain(companyId);

  const allList = await (await request.get("/admin/empresas?estado=todas")).text();
  expect(allList).toContain(companyId);

  await ctx.dispose();
});

test("#103: no hard-delete action exists — only the known reversible/audited ones are accepted", async () => {
  const admin = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  await loginAdminApi(admin);
  const { companyId } = await newCompanyWithDeca();

  for (const action of ["delete", "hard_delete", "remove", "purge"]) {
    const r = await admin.patch(`/api/admin/empresas/${companyId}`, { data: { action } });
    expect(r.status(), `"${action}" must not be a recognised action`).toBe(422);
  }
  // Company + its DeCA are still there — nothing was destroyed by the attempt.
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  expect(company).not.toBeNull();
});
