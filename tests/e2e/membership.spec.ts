import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { loginAdminApi } from "./helpers/admin-auth";

const prisma = new PrismaClient();
test.afterAll(() => prisma.$disconnect());

/**
 * #102 — the reported bug, reproduced exactly, plus the issue's own AC
 * checklist. Before this fix: a user with their own company A, invited to
 * and accepting company B, silently lost A (`companyId` overwritten);
 * removing them from B then left them with `companyId: null` — Superadmin
 * showed A with 0 members and no way back in except registering from
 * scratch. Every scenario here is the exact shape of that report.
 */

function email(p = "mem") {
  return `${p}-${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}
const PASSWORD = "Supersecret123!";

async function registerCompany(page: Page, companyName: string): Promise<{ email: string }> {
  const addr = email();
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", PASSWORD);
  await page.fill("#companyName", companyName);
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
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
  return { email: addr };
}

/** Owner of `ctx`'s active company invites `targetEmail`, returns the raw invite link. */
async function invite(ctx: APIRequestContext, targetEmail: string): Promise<string> {
  const res = await ctx.post("/api/team/invites", { data: { email: targetEmail, role: "member" } });
  expect(res.status()).toBe(201);
  return (await res.json()).link as string;
}

function tokenOf(link: string): string {
  return new URL(link).searchParams.get("invite")!;
}

test.describe("#102 — the exact reported bug is fixed", () => {
  test("a user who already owns company A keeps it after accepting an invite to company B", async ({
    page,
    browser,
  }) => {
    const { email: userEmail } = await registerCompany(page, "Empresa Propia SL");
    await expect(page.getByRole("heading", { name: "Empresa Propia SL" })).toBeVisible();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerCompany(pageB, "Empresa Que Invita SL");
    const link = await invite(pageB.request, userEmail);
    await ctxB.close();

    // The user (still logged into A) follows the invite link.
    await page.goto(`/registro?invite=${tokenOf(link)}`);
    await page.waitForURL("**/panel");

    // THE BUG: company A must still be reachable — never replaced by B.
    // Accepting also switches active company to the one just joined (B),
    // so A is reached back through the workspace switcher.
    await page.getByTestId("account-menu").locator("summary").click();
    await expect(page.getByTestId("company-switcher")).toBeVisible();
    await expect(page.getByTestId("company-switcher")).toContainText("Empresa Propia SL");
    await expect(page.getByTestId("company-switcher")).toContainText("Empresa Que Invita SL");
    await page.getByText("Empresa Propia SL", { exact: true }).click();
    await page.waitForURL("**/panel");
    await expect(page.getByRole("heading", { name: "Empresa Propia SL" })).toBeVisible();
  });

  test("removing a member from company B does not lock them out of company A", async ({
    page,
    browser,
  }) => {
    const { email: userEmail } = await registerCompany(page, "Casa Original SL");

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerCompany(pageB, "Casa Ajena SL");
    const link = await invite(pageB.request, userEmail);

    await page.goto(`/registro?invite=${tokenOf(link)}`);
    await page.waitForURL("**/panel");
    // Accepting switched active company to B — switch back to A, exactly the
    // reported scenario (member of both, currently sitting in A).
    await page.evaluate(async () => {
      const { companies } = await (await fetch("/api/team/companies")).json();
      const a = companies.find(
        (c: { companyName: string; companyId: string }) => c.companyName === "Casa Original SL",
      );
      await fetch("/api/team/companies", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId: a.companyId }),
      });
    });

    // Owner of B removes the shared user.
    await pageB.goto("/panel/equipo");
    pageB.once("dialog", (d) => d.accept());
    await pageB.getByTestId(`remove-member-${userEmail}`).click();
    await expect(pageB.getByTestId("member-list")).not.toContainText(userEmail);
    await ctxB.close();

    // THE FIX: the removed user still lands on their OWN company (A) — never
    // a bare "Crear cuenta gratis" registration screen, which was the bug.
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Casa Original SL" })).toBeVisible();
  });

  /**
   * D-178 (user's explicit follow-up on #102): the case above switches back
   * to A BEFORE removal, so `leaveCompany`'s own fallback selection
   * (`pickFallbackMembership`) is never actually exercised — by the time B
   * removes the user, A was already their active company, and the "was
   * this their active company?" guard short-circuits. THIS test removes
   * the user while B — not A — is still active, so the automatic fallback
   * itself is what has to land them back on A, with no manual switch and
   * no onboarding screen in between.
   */
  test("D-178: member of A, joins B (active), removed from B → lands back on A automatically, no onboarding", async ({
    page,
    browser,
  }) => {
    const { email: userEmail } = await registerCompany(page, "Hogar SL");

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerCompany(pageB, "Trabajo SL");
    const link = await invite(pageB.request, userEmail);

    // Accept the invite — B becomes the active company. No switch back to A.
    await page.goto(`/registro?invite=${tokenOf(link)}`);
    await page.waitForURL("**/panel");
    await expect(page.getByRole("heading", { name: "Trabajo SL" })).toBeVisible();

    // Owner of B removes the shared user while B is still their active company.
    await pageB.goto("/panel/equipo");
    pageB.once("dialog", (d) => d.accept());
    await pageB.getByTestId(`remove-member-${userEmail}`).click();
    await expect(pageB.getByTestId("member-list")).not.toContainText(userEmail);
    await ctxB.close();

    // The fallback lands them straight on A — never the new-account signup
    // form, never a "create your company" onboarding screen.
    const res = await page.goto("/panel");
    expect(res?.url()).toContain("/panel");
    await expect(page.getByRole("heading", { name: "Trabajo SL" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Hogar SL" })).toBeVisible();

    // Superadmin shows both real memberships — B's is gone (removed), A's
    // is still there and marked as the active one.
    const admin = await browser.newContext();
    const adminPage = await admin.newPage();
    await loginAdminApi(adminPage.request);
    const user = await prisma.user.findFirstOrThrow({ where: { email: userEmail } });
    await adminPage.goto(`/admin/usuarios/${user.id}`);
    const membershipsSection = adminPage.locator("section:has(#memberships)");
    await expect(membershipsSection.getByText("Hogar SL")).toBeVisible();
    await expect(membershipsSection.getByText("Trabajo SL")).not.toBeVisible();
    const activeRow = membershipsSection.getByRole("row").filter({ hasText: "Hogar SL" });
    await expect(activeRow.getByText("activa", { exact: true })).toBeVisible();
    await admin.close();
  });

  test("accepting the same invite twice is idempotent — no error, no reassignment", async ({
    page,
    browser,
  }) => {
    const { email: userEmail } = await registerCompany(page, "Doble Aceptación SL");

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerCompany(pageB, "Invita Dos Veces SL");
    const link = await invite(pageB.request, userEmail);
    await ctxB.close();

    const token = tokenOf(link);
    await page.goto(`/registro?invite=${token}`);
    await page.waitForURL("**/panel");
    await page.goto(`/registro?invite=${token}`);
    await page.waitForURL("**/panel");
    await expect(page.getByRole("heading", { name: "Invita Dos Veces SL" })).toBeVisible();
  });

  test("a brand-new user accepting an invite creates no extra company", async ({
    page,
    browser,
  }) => {
    const ctxOwner = await browser.newContext();
    const pageOwner = await ctxOwner.newPage();
    await registerCompany(pageOwner, "Empresa Anfitriona SL");
    const newEmail = email("brandnew");
    const link = await invite(pageOwner.request, newEmail);
    await ctxOwner.close();

    await page.goto(`/registro?invite=${tokenOf(link)}`);
    // The team-invite flow shows no company fields — nothing to fill, so
    // there is nothing that could create a second company.
    await expect(page.locator("#companyName")).toHaveCount(0);
    await page.fill("#email", newEmail);
    await page.fill("#password", PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
      page.getByTestId("register-submit").click(),
    ]);
    // A fresh registration always lands on /verificar-email first (D-053) —
    // /panel itself is still reachable unverified, generation just isn't.
    await expect(page).toHaveURL(/\/verificar-email/);
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Empresa Anfitriona SL" })).toBeVisible();
  });

  test("removing a member never deletes their account — they can still log in", async ({
    page,
    browser,
  }) => {
    const targetEmail = email("kept-alive");
    const ctxOwner = await browser.newContext();
    const pageOwner = await ctxOwner.newPage();
    await registerCompany(pageOwner, "Empresa Que Elimina SL");
    const link = await invite(pageOwner.request, targetEmail);

    await page.goto(`/registro?invite=${tokenOf(link)}`);
    await page.fill("#email", targetEmail);
    await page.fill("#password", PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
      page.getByTestId("register-submit").click(),
    ]);
    await expect(page).toHaveURL(/\/verificar-email/);
    await page.goto("/panel");

    await pageOwner.goto("/panel/equipo");
    pageOwner.once("dialog", (d) => d.accept());
    await pageOwner.getByTestId(`remove-member-${targetEmail}`).click();
    await expect(pageOwner.getByTestId("member-list")).not.toContainText(targetEmail);
    await ctxOwner.close();

    // The account itself survives — they can still log in (with no company,
    // since this was their only membership, which is the one legitimate
    // "no company" outcome).
    await page.goto("/entrar");
    await page.fill("#email", targetEmail);
    await page.fill("#password", PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
      page.getByTestId("register-submit").click(),
    ]);

    // D-173 — the reported production bug: a logged-in, company-less user
    // visiting `/panel` used to be sent to the full NEW-ACCOUNT registration
    // form (`/registro`), which then correctly rejected their own email as
    // already taken — a dead-end loop with no way back in. `/panel` must
    // send them to the session-aware completion step instead, which lets
    // them found a new company and actually reach a working panel.
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/registro\/completar-empresa$/);

    await page.fill("#companyName", "Empresa Recuperada SL");
    await page.fill("#companyNif", "B12345674");
    await page.fill("#companyContactName", "Ana Ejemplo");
    await page.fill("#companyPhone", "600111222");
    await page.fill("#companyEmail", "empresa@example.com");
    await page.fill("#companyAddress", "Calle Prueba 1");
    await page.fill("#companyPostalCode", "46540");
    await page.fill("#companyCity", "El Puig");
    await page.getByTestId("accept-terms").check();
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/auth/complete-company") && r.status() === 200,
      ),
      page.getByTestId("complete-company-submit").click(),
    ]);
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByTestId("app-crear")).toBeVisible();
  });
});
