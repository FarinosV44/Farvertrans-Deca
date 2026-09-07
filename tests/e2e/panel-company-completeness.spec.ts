import { test, expect } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * #59 soft gate — a company registered before the full-ficha requirement is
 * asked to complete its data before creating a new DeCA. It is never blocked
 * from logging in, and its already-issued documents are never affected.
 */

const prisma = new PrismaClient();
test.afterAll(() => prisma.$disconnect());

function email() {
  return `comp59${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

const LOC = (name: string, city: string, cp: string, prov: string) => ({
  name,
  address: "Calle Ejemplo 1",
  postalCode: cp,
  city,
  province: prov,
  country: "España",
});
const DECA_PAYLOAD = {
  shipper: { name: "Cargas SL", nif: "B96789011", address: "Av. del Puerto 120, Valencia" },
  carrier: { name: "Trans SL", nif: "B12345674", address: "Calle Transporte 9, Sagunto" },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  loadLocation: LOC("Almacén Norte", "Valencia", "46023", "Valencia"),
  unloadLocation: LOC("Almacén Sur", "Madrid", "28028", "Madrid"),
  tractorPlate: "1234 BCD",
  goods: "Palés de bebida",
  weight: "12000 kg",
};

test("incomplete company: banner shown, DeCA creation blocked, then unblocked after completing", async ({
  request,
}) => {
  const addr = email();
  const reg = await request.post("/api/auth/register", {
    data: {
      email: addr,
      password: "Supersecret123!",
      companyName: "Empresa Antigua SL",
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
  expect(reg.status()).toBe(201);
  const { verifyTestToken } = await reg.json();
  await request.get(`/verificar-email/${verifyTestToken}`);

  const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });

  // Simulate a pre-#59 company: wipe the fields #59 added and the completion stamp.
  await prisma.company.update({
    where: { id: user.companyId! },
    data: { postalCode: null, city: null, contactName: null, dataCompletedAt: null },
  });

  // The soft gate blocks a new DeCA...
  const blocked = await request.post("/api/deca", { data: DECA_PAYLOAD });
  expect(blocked.status()).toBe(409);
  expect((await blocked.json()).error.code).toBe("company_data_incomplete");

  // ...and the panel surfaces the "completa tus datos" notice.
  const panel = await request.get("/panel/empresa");
  expect(await panel.text()).toContain("Completa los datos de tu empresa");

  // Completing the ficha lifts the gate.
  const patch = await request.patch("/api/company/profile", {
    data: {
      email: "empresa@example.com",
      phone: "600111222",
      address: "Calle Prueba 1",
      postalCode: "46540",
      city: "El Puig",
      contactName: "Ana Ejemplo",
    },
  });
  expect(patch.status()).toBe(200);
  expect((await patch.json()).complete).toBe(true);

  const ok = await request.post("/api/deca", { data: DECA_PAYLOAD });
  expect(ok.status()).toBe(201);
});
