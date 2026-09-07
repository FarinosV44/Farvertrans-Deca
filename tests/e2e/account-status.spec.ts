import { test, expect } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * #62 (enforcement layer) — a non-`active` user, or one whose company is
 * non-`active`, has no session and cannot log back in. `/d/[token]` for an
 * already-issued DeCA is never affected (checked in the lifecycle spec once
 * the admin UI lands).
 */

const prisma = new PrismaClient();
test.afterAll(() => prisma.$disconnect());

function email() {
  return `status62${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

const FICHA = {
  companyName: "Estado SL",
  companyNif: "B12345674",
  companyContactName: "Ana Ejemplo",
  companyPhone: "600111222",
  companyEmail: "empresa@example.com",
  companyAddress: "Calle Prueba 1",
  companyPostalCode: "46540",
  companyCity: "El Puig",
};

test("blocking a user kills the live session and refuses the next login", async ({ request }) => {
  const addr = email();
  const reg = await request.post("/api/auth/register", {
    data: { email: addr, password: "Supersecret123!", acceptTerms: true, ...FICHA },
  });
  expect(reg.status()).toBe(201);

  // Session works.
  expect((await request.get("/api/auth/verify-email/status")).status()).toBe(200);

  await prisma.user.update({
    where: { id: (await prisma.user.findFirstOrThrow({ where: { email: addr } })).id },
    data: { status: "blocked", statusReason: "test", statusChangedAt: new Date() },
  });

  // The same session is now dead.
  const afterBlock = await request.get("/api/auth/verify-email/status");
  expect(afterBlock.status()).toBe(401);

  // And a fresh login is refused with a clear reason.
  const login = await request.post("/api/auth/login", {
    data: { email: addr, password: "Supersecret123!" },
  });
  expect(login.status()).toBe(401);
  expect((await login.json()).error.code).toBe("account_suspended");
});

test("deactivating the company blocks its members too", async ({ request }) => {
  const addr = email();
  await request.post("/api/auth/register", {
    data: { email: addr, password: "Supersecret123!", acceptTerms: true, ...FICHA },
  });
  const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });
  await prisma.company.update({
    where: { id: user.companyId! },
    data: { status: "deactivated", statusChangedAt: new Date() },
  });

  const login = await request.post("/api/auth/login", {
    data: { email: addr, password: "Supersecret123!" },
  });
  expect(login.status()).toBe(401);
  expect((await login.json()).error.code).toBe("account_suspended");
});
