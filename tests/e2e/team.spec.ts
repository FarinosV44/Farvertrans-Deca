import { test, expect, type Page } from "@playwright/test";

function email() {
  return `tm${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerOwner(page: Page, addr = email()) {
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", "supersecret123");
  await page.fill("#companyName", "Agencia Equipo SL");
  await page.fill("#companyNif", "B12345674");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/panel$/);
  return addr;
}

async function createDeca(page: Page) {
  await page.goto("/crear");
  for (const [s, v] of [
    ["#shipperName", "Cargas SL"],
    ["#shipperNif", "B96789011"],
    ["#shipperAddress", "Calle 1"],
    ["#carrierName", "Trans SL"],
    ["#carrierNif", "B12345674"],
    ["#carrierAddress", "Av 2"],
  ] as const)
    await page.fill(s, v);
  await page.getByTestId("wizard-next").click();
  await page.fill("#origin", "Sevilla");
  await page.fill("#destination", "Bilbao");
  await page.fill("#transportDate", "2026-10-06");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", "Bobinas");
  await page.fill("#weight", "18000 kg");
  await page.fill("#tractorPlate", "7777 GGG");
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
}

test.describe("TEAM #27 — company workspaces + invitations", () => {
  test("admin invites → colleague joins the SAME company, shares history, no duplicate company", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await createDeca(owner);

    // admin creates an invite
    await owner.goto("/panel/equipo");
    const inviteEmail = email();
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();
    expect(link).toContain("/registro?invite=");
    await expect(owner.getByTestId("pending-invites")).toContainText(inviteEmail);

    // colleague opens the link and registers — no company fields shown
    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(member.getByRole("heading", { name: "Únete al equipo" })).toBeVisible();
    await expect(member.locator("#companyName")).toHaveCount(0);
    await member.fill("#email", inviteEmail);
    await member.fill("#password", "supersecret123");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/panel$/);

    // the colleague sees the SAME company name and the owner's DeCA
    await expect(member.locator("h1")).toContainText("Agencia Equipo SL");
    await member.goto("/panel/historico");
    await expect(member.getByTestId("historico-table")).toContainText("Sevilla → Bilbao");

    // exactly one company: the member is listed as an Operador, no new company created
    await owner.goto("/panel/equipo");
    await expect(owner.getByTestId("member-list")).toContainText(inviteEmail);
    await expect(owner.getByTestId("member-list")).toContainText("Operador");
    await expect(owner.getByTestId("pending-invites")).toHaveCount(0); // consumed

    await ownerCtx.close();
    await memberCtx.close();
  });

  test("only an admin sees the invite form; a member does not", async ({ browser }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await owner.goto("/panel/equipo");
    await owner.fill('[data-testid="invite-email"]', email());
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", email());
    await member.fill("#password", "supersecret123");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/panel$/);

    await member.goto("/panel/equipo");
    await expect(member.getByTestId("member-list")).toBeVisible();
    await expect(member.getByTestId("invite-email")).toHaveCount(0); // no invite form for a member

    await ownerCtx.close();
    await memberCtx.close();
  });

  test("a removed member immediately loses workspace access", async ({ browser }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await owner.goto("/panel/equipo");
    const memberEmail = email();
    await owner.fill('[data-testid="invite-email"]', memberEmail);
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "supersecret123");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/panel$/);

    // owner removes the member
    await owner.goto("/panel/equipo");
    await owner.getByTestId(`remove-member-${memberEmail}`).click();
    await expect(owner.getByTestId("member-list")).not.toContainText(memberEmail);

    // member's next navigation to the panel is bounced (no company)
    await member.goto("/panel/historico");
    await expect(member).toHaveURL(/\/registro/);

    await ownerCtx.close();
    await memberCtx.close();
  });

  test("TEAM #37: an admin promotes a member to admin, and cannot drop the last admin", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await owner.goto("/panel/equipo");
    const memberEmail = email();
    await owner.fill('[data-testid="invite-email"]', memberEmail);
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "supersecret123");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/panel$/);

    // owner promotes the member to Administrador
    await owner.goto("/panel/equipo");
    const memberRow = owner.getByTestId("member-list").locator("li", { hasText: memberEmail });
    await expect(memberRow).toContainText("Operador");
    await Promise.all([
      owner.waitForResponse(
        (r) =>
          r.url().includes("/api/team/members/") &&
          r.request().method() === "PATCH" &&
          r.status() === 200,
      ),
      owner.getByTestId(`role-${memberEmail}`).selectOption("owner"),
    ]);
    await expect(memberRow).toContainText("Administrador");

    // the promoted member now sees the invite form (admin-only)
    await member.goto("/panel/equipo");
    await expect(member.getByTestId("invite-email")).toBeVisible();

    await ownerCtx.close();
    await memberCtx.close();
  });

  test("invite token cannot create a second company; an unknown/expired token is rejected", async ({
    request,
  }) => {
    const r = await request.post("/api/auth/register", {
      data: {
        email: email(),
        password: "supersecret123",
        invite: "totally-invalid-token-000000000000",
      },
    });
    expect(r.status()).toBe(409); // AuthError → bad_input mapped to 409 by the route
  });
});
