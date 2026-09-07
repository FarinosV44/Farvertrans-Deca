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

test("the lifecycle routes are step-up gated and internal-only", async () => {
  const anon = await pwRequest.newContext({ baseURL: "http://localhost:3000" });
  const r = await anon.patch("/api/admin/usuarios/whatever", { data: { action: "block" } });
  expect(r.status()).toBe(404); // not internal → the area does not exist
});
