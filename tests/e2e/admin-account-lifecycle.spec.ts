import { test, expect, request as pwRequest } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { ADMIN, adminTotpCode, loginAdminApi, internalPage } from "./helpers/admin-auth";
import { signSession, SESSION_COOKIE } from "@/lib/auth/session";

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

/**
 * #103 follow-up (D-170) — SUPERSEDES the previous version of this test,
 * which exercised company anonymization as a normal Superadmin action. The
 * user's explicit correction: NO irreversible action may be reachable from
 * normal Superadmin for a company — a compromised session, a human mistake,
 * or a permissions bug must never be able to trigger one. `anonymize` is
 * REJECTED for companies now; the underlying `anonymizeCompany()` function
 * still exists in `lib/admin/anonymize.ts` as the building block for a
 * future controlled, exceptional, out-of-band procedure — but it is wired
 * to nothing reachable from the web, verified directly here.
 */
test("a company cannot be anonymized through Superadmin — no irreversible action is web-reachable", async ({
  request,
}) => {
  const { token, companyId } = await newCompanyWithDeca();
  const decaCountBefore = await prisma.deca.count({ where: { companyId } });
  await loginAdminApi(request);

  for (const payload of [
    { action: "anonymize", confirm: "ANONIMIZAR" },
    { action: "anonymize", confirm: "nope" },
    { action: "delete" },
    { action: "hard_delete" },
  ]) {
    const res = await request.patch(`/api/admin/empresas/${companyId}`, { data: payload });
    expect(res.status(), `"${payload.action}" must not be a recognised action`).toBe(422);
  }

  // Nothing about the company changed as a result of the attempts.
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  expect(company.status).toBe("active");
  expect(company.nif).not.toBeNull();
  expect(company.anonymizedAt).toBeNull();
  expect(await prisma.deca.count({ where: { companyId } })).toBe(decaCountBefore);
  expect((await request.get(`/d/${token}`)).status()).toBe(200);

  // Block/deactivate/reactivate stay available and reversible — never removed.
  const blocked = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "block", reason: "test" },
  });
  expect(blocked.status()).toBe(200);
  const reactivated = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "reactivate" },
  });
  expect(reactivated.status()).toBe(200);
  expect((await prisma.company.findUniqueOrThrow({ where: { id: companyId } })).status).toBe(
    "active",
  );
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

  // A valid CIF goes through. "B12345674" is the shared fixture NIF dozens of
  // OTHER e2e specs also register with, so the new duplicate-NIF warning
  // (superadmin ficha-edit feature) fires here every time — `confirmDuplicateNif`
  // is exactly the override path a real superadmin would take after seeing it,
  // not a workaround for a real production collision.
  const ok = await request.patch(`/api/admin/empresas/${companyId}`, {
    data: { action: "edit", data: { ...base, nif: "B12345674" }, confirmDuplicateNif: true },
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

/**
 * User report (2026-09-09): "el botón de marcar como prueba en el super admin
 * no va" — clicking it visibly does nothing. Root cause: `MarkTest` (unlike
 * `AccountActions`, which gates the very same step-up-protected endpoint) only
 * ever checks `res.ok` and does nothing at all otherwise — a `step_up_required`
 * 401 (the caller's last TOTP check is older than 10 min, per `requireStepUp`)
 * is swallowed with no error, no message, no link to re-verify. The button
 * LOOKS broken because nothing on screen tells the admin why it did nothing.
 *
 * Same report, live follow-up: "le doy [el 2FA] y solo recarga a otra pagina
 * ... y no va nada luego es como que se queda pillado". The "Verificar" link
 * carried no `next`, so `/admin/2fa/verify` always sent the admin back to the
 * generic `/admin` dashboard, not the ficha they were on — nothing on screen
 * said to go back and retry, which read as the flow getting stuck.
 */
test("D-184: 'Marcar como prueba' surfaces a step-up-required error and returns the admin to this exact ficha, not /admin", async ({
  browser,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    // Force the exact server response a stale-but-still-admin-session
    // produces, without waiting out the real 10-minute step-up window.
    await page.route(`**/api/admin/empresas/${companyId}`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "step_up_required", message: "Verifica tu identidad de nuevo." },
        }),
      });
    });

    await page.goto(`/admin/empresas/${companyId}`);
    await page.getByTestId("mark-test-toggle").click();

    await expect(page.getByText("Verifica tu identidad de nuevo para esta acción.")).toBeVisible();
    const verificar = page.getByRole("link", { name: "Verificar" });
    await expect(verificar).toHaveAttribute(
      "href",
      `/admin/2fa/verify?next=${encodeURIComponent(`/admin/empresas/${companyId}`)}&stepup=1`,
    );

    // Following it (this session's own step-up is already fresh from
    // internalPage()'s login, so the verify page's own "already fresh, don't
    // re-render the challenge" short-circuit fires immediately here — the
    // same code path a real re-verification lands on) must return the admin
    // to THIS ficha, never the generic /admin dashboard.
    await verificar.click();
    await page.waitForURL(new RegExp(`/admin/empresas/${companyId}$`));
  } finally {
    await close();
  }
});

// #108 follow-up: `AccountActions` (Bloquear/Dar de baja/Reactivar) gates the
// exact same step-up-protected endpoint class and carried the identical
// missing-`next` defect — fixed the same way, verified the same way.
test("D-184: account-lifecycle actions (Bloquear) also return the admin to this exact ficha after re-verifying", async ({
  browser,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    await page.route(`**/api/admin/empresas/${companyId}`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "step_up_required", message: "Verifica tu identidad de nuevo." },
        }),
      });
    });

    await page.goto(`/admin/empresas/${companyId}`);
    await page.getByTestId("account-block").click();

    const verificar = page.getByRole("link", { name: "Verificar" });
    await expect(verificar).toHaveAttribute(
      "href",
      `/admin/2fa/verify?next=${encodeURIComponent(`/admin/empresas/${companyId}`)}&stepup=1`,
    );
    await verificar.click();
    await page.waitForURL(new RegExp(`/admin/empresas/${companyId}$`));
  } finally {
    await close();
  }
});

// User report (2026-09-12, live in production): "al darle a verificar en
// panel de super admin para hacer la accion de editar los datos de la
// empresa le das y te expulsa no funciona" — the exact D-184/D-194 defect
// class, reintroduced in `CompanyEditForm` (added later, for #62's "corregir
// razón social y CIF/NIF" work): its "Verificar" link was a bare
// `/admin/2fa/verify` with neither `next` nor `stepup=1`, so it always used
// the 12h admin-freshness check instead of the 10-minute step-up window and
// bounced the admin to the generic `/admin` dashboard instead of re-
// challenging — indistinguishable from being logged out. Fixed the same way
// as D-184/D-194, verified the same way. `components/admin/security-screen.tsx`'s
// `StepUpNotice` (used by 4 separate security actions) carried the identical
// bare-link defect and was fixed in the same pass.
test("#62 correction: editing a company's ficha also returns the admin to this exact ficha after re-verifying, not /admin", async ({
  browser,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    await page.route(`**/api/admin/empresas/${companyId}`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "step_up_required", message: "Verifica tu identidad de nuevo." },
        }),
      });
    });

    await page.goto(`/admin/empresas/${companyId}`);
    await page.getByText("Editar ficha de la empresa").click();
    await page.getByTestId("company-edit-save").click();

    const verificar = page.getByRole("link", { name: "Verificar" });
    await expect(verificar).toHaveAttribute(
      "href",
      `/admin/2fa/verify?next=${encodeURIComponent(`/admin/empresas/${companyId}`)}&stepup=1`,
    );
    await verificar.click();
    await page.waitForURL(new RegExp(`/admin/empresas/${companyId}$`));
  } finally {
    await close();
  }
});

// Found while sweeping for the same D-184/D-194 defect class after fixing
// #138 (company-edit-form.tsx, security-screen.tsx): `MembershipReassign`
// handled `step_up_required` only as a bare, unlinked error message — no way
// to re-verify from the page at all, the same "silently stuck" shape D-184
// originally found in `MarkTest` before it got a link.
test("#138 sweep: MembershipReassign's step-up error also offers a working 'Verificar' link back to this exact ficha", async ({
  browser,
}) => {
  const { ctx, userId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    await page.route(`**/api/admin/usuarios/${userId}`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "step_up_required", message: "Verifica tu identidad de nuevo." },
        }),
      });
    });

    await page.goto(`/admin/usuarios/${userId}`);
    await page.getByTestId("membership-reassign").locator("summary").click();
    await page.getByTestId("reassign-company-id").fill("some-other-company-id");
    await page.getByTestId("reassign-reason").fill("prueba de reasignación");
    await page.getByTestId("reassign-submit").click();

    const verificar = page.getByRole("link", { name: "Verificar" });
    await expect(verificar).toHaveAttribute(
      "href",
      `/admin/2fa/verify?next=${encodeURIComponent(`/admin/usuarios/${userId}`)}&stepup=1`,
    );
    await verificar.click();
    await page.waitForURL(new RegExp(`/admin/usuarios/${userId}$`));
  } finally {
    await close();
  }
});

/**
 * User report (2026-09-10): after clicking "Verificar" the page reloads back
 * to the same ficha unchanged, and clicking the action again does the same —
 * "no hay forma de completar la verificación".
 *
 * Root cause (D-194): D-184 surfaced the `step_up_required` error with a
 * "Verificar" link, but `/admin/2fa/verify` skips the code challenge whenever
 * the last TOTP check is inside the 12h ADMIN window (`isAdmin2faFresh()`),
 * while a step-up action needs a check inside the 10-minute window
 * (`requireStepUp()`). An admin browsing for >10 min is "fresh" for the verify
 * page but "stale" for the action → the challenge never renders, `tv` is never
 * refreshed, and the action loops on 401 forever.
 *
 * This drives the REAL endpoint (no `page.route` mock) against a genuinely
 * stale step-up, by re-signing this session's cookie with an aged `tv`.
 */
test("D-194: a stale step-up is actually refreshable — 'Verificar' re-challenges instead of looping, and the pending action completes", async ({
  browser,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    // Age this session's admin TOTP check to 20 minutes: still inside the 12h
    // admin window (so /admin pages load), but stale for step-up (>10 min).
    const admin = await prisma.user.findFirstOrThrow({
      where: { email: ADMIN.email },
      select: { id: true, sessionVersion: true },
    });
    const staleTv = Math.floor(Date.now() / 1000) - 20 * 60;
    await page.context().addCookies([
      {
        name: SESSION_COOKIE,
        value: signSession(admin.id, admin.sessionVersion, staleTv),
        url: "http://localhost:3000",
      },
    ]);

    await page.goto(`/admin/empresas/${companyId}`);
    await page.getByTestId("mark-test-toggle").click();

    // Real (un-mocked) step-up rejection.
    const verificar = page.getByRole("link", { name: "Verificar" });
    await expect(verificar).toBeVisible();
    await verificar.click();

    // BEFORE THE FIX: the verify page sees a 12h-fresh session and redirects
    // straight back to the ficha — this input never appears and the admin is
    // stuck. AFTER: the challenge is shown so `tv` can actually be refreshed.
    await expect(page.getByTestId("totp-verify-input")).toBeVisible();

    await page.getByTestId("totp-verify-input").fill(adminTotpCode());
    await page.getByTestId("totp-verify-submit").click();

    // Returned to the ficha, and the action the admin started before
    // re-verifying is replayed automatically — no need to hunt for the button.
    await page.waitForURL(new RegExp(`/admin/empresas/${companyId}$`));
    await expect(page.getByTestId("mark-test-toggle")).toHaveText("Quitar marca de prueba");
    expect((await prisma.company.findUniqueOrThrow({ where: { id: companyId } })).isTest).toBe(
      true,
    );
  } finally {
    await close();
  }
});

/**
 * D-194: the user's report also asked that a FAILED mutation never just
 * silently reload — it must show an explicit error. A non-step-up failure
 * (here a forced 500) surfaces the generic message and the admin stays on the
 * ficha; nothing is stashed for replay (only `step_up_required` is).
 */
test("D-194: a failed 'Marcar como prueba' shows an explicit error and does not silently reload", async ({
  browser,
}) => {
  const { ctx, companyId } = await newCompanyWithDeca();
  await ctx.dispose();

  const { page, close } = await internalPage(browser);
  try {
    await page.route(`**/api/admin/empresas/${companyId}`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "internal" } }),
      });
    });

    await page.goto(`/admin/empresas/${companyId}`);
    const urlBefore = page.url();

    await page.getByTestId("mark-test-toggle").click();

    // Explicit error, in place — no navigation, no reload, the toggle still
    // shows its original label (nothing changed under the admin).
    await expect(page.getByText("No se pudo completar la acción.")).toBeVisible();
    expect(page.url()).toBe(urlBefore);
    await expect(page.getByTestId("mark-test-toggle")).toHaveText("Marcar como prueba");
    // The failure left nothing behind: reloading does not replay the action.
    await page.unroute(`**/api/admin/empresas/${companyId}`);
    await page.reload();
    await expect(page.getByTestId("mark-test-toggle")).toHaveText("Marcar como prueba");
    expect((await prisma.company.findUniqueOrThrow({ where: { id: companyId } })).isTest).toBe(
      false,
    );
  } finally {
    await close();
  }
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
