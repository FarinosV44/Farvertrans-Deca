import { test, expect, type Page } from "@playwright/test";

function email() {
  return `tm${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerOwner(page: Page, addr = email(), companyName = "Agencia Equipo SL") {
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", "Supersecret123!");
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
  await expect(page).toHaveURL(/\/verificar-email/);
  // D-053: generation is a hard gate on emailVerifiedAt — verify for real.
  const body = await res.json();
  await page.request.get(`/verificar-email/${body.verifyTestToken}`);
  await page.goto("/panel");
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
  for (const [s, v] of [
    ["#loadLocationName", "Almacén Sevilla"],
    ["#loadLocationAddress", "Calle 1"],
    ["#loadLocationPostalCode", "41001"],
    ["#loadLocationCity", "Sevilla"],
    ["#loadLocationProvince", "Sevilla"],
    ["#loadLocationCountry", "España"],
    ["#loadDate", "2026-10-06"],
    ["#unloadLocationName", "Almacén Bilbao"],
    ["#unloadLocationAddress", "Av 2"],
    ["#unloadLocationPostalCode", "48001"],
    ["#unloadLocationCity", "Bilbao"],
    ["#unloadLocationProvince", "Vizcaya"],
    ["#unloadLocationCountry", "España"],
    ["#unloadDate", "2026-10-06"],
  ] as const)
    await page.fill(s, v);
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
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);
    await member.goto("/panel");

    // the colleague sees the SAME company name and the owner's DeCA
    await expect(member.locator("h1")).toContainText("Agencia Equipo SL");
    await member.goto("/panel/historico");
    await expect(member.getByTestId("historico-table")).toContainText(
      "ALMACÉN SEVILLA — SEVILLA → ALMACÉN BILBAO — BILBAO",
    );

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
    const memberEmail = email();
    await owner.fill('[data-testid="invite-email"]', memberEmail);
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);
    await member.goto("/panel");

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
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);
    await member.goto("/panel");

    // owner removes the member — #102: now a confirm dialog naming the company
    await owner.goto("/panel/equipo");
    owner.once("dialog", (d) => d.accept());
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
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);
    await member.goto("/panel");

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

  // #132 — two owners removing each other AT THE SAME TIME must never leave the
  // workspace with zero owners: the "keep at least one owner" check has to be
  // race-safe, not just correct for one request at a time.
  test("#132: two owners removing each other concurrently — exactly one succeeds, one owner always remains", async ({
    browser,
  }) => {
    const ownerACtx = await browser.newContext();
    const ownerA = await ownerACtx.newPage();
    await registerOwner(ownerA);
    await ownerA.goto("/panel/equipo");
    const memberEmail = email();
    await ownerA.fill('[data-testid="invite-email"]', memberEmail);
    await ownerA.getByTestId("invite-submit").click();
    const link = (await ownerA.locator("p.font-mono").first().textContent())!.trim();

    const ownerBCtx = await browser.newContext();
    const ownerB = await ownerBCtx.newPage();
    await ownerB.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await ownerB.fill("#email", memberEmail);
    await ownerB.fill("#password", "Supersecret123!");
    await ownerB.getByTestId("register-submit").click();
    await expect(ownerB).toHaveURL(/\/verificar-email/);
    await ownerB.goto("/panel");

    // promote the new member to owner — now the company has exactly 2 owners
    await ownerA.goto("/panel/equipo");
    await Promise.all([
      ownerA.waitForResponse(
        (r) =>
          r.url().includes("/api/team/members/") &&
          r.request().method() === "PATCH" &&
          r.status() === 200,
      ),
      ownerA.getByTestId(`role-${memberEmail}`).selectOption("owner"),
    ]);

    // each side's own page renders a role <select> only for the OTHER
    // member (`isAdmin && m.id !== meId`) — its id attribute is `role-<id>`.
    await ownerB.goto("/panel/equipo");
    const idBSeesA = await ownerB.locator('select[id^="role-"]').getAttribute("id");
    const idOfOwnerA = idBSeesA!.replace(/^role-/, "");
    const idASeesB = await ownerA.locator('select[id^="role-"]').getAttribute("id");
    const idOfOwnerB = idASeesB!.replace(/^role-/, "");

    // fire both removals at the same instant: A removes B, B removes A.
    const [resA, resB] = await Promise.all([
      ownerA.request.fetch(`/api/team/members/${idOfOwnerB}`, { method: "DELETE" }),
      ownerB.request.fetch(`/api/team/members/${idOfOwnerA}`, { method: "DELETE" }),
    ]);

    // exactly one wins (200) and the other is rejected by the last-owner
    // guard (422) — NEVER both 200 (zero owners) and never both rejected.
    expect([resA.status(), resB.status()].sort()).toEqual([200, 422]);

    // resA succeeding means A's removal of B went through, so A is the
    // survivor (and vice versa).
    const survivor = resA.status() === 200 ? ownerA : ownerB;
    await survivor.goto("/panel/equipo");
    await expect(survivor.getByTestId("invite-email")).toBeVisible();

    await ownerACtx.close();
    await ownerBCtx.close();
  });

  test("PRODUCT #56: a read_only member can view history but cannot create or correct a DeCA", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await createDeca(owner);

    // owner invites with the "Solo lectura" role selected up front
    await owner.goto("/panel/equipo");
    const auditorEmail = email();
    await owner.fill('[data-testid="invite-email"]', auditorEmail);
    await owner.getByTestId("invite-role").selectOption("read_only");
    await owner.getByTestId("invite-submit").click();
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    const auditorCtx = await browser.newContext();
    const auditor = await auditorCtx.newPage();
    await auditor.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await auditor.fill("#email", auditorEmail);
    await auditor.fill("#password", "Supersecret123!");
    const [regRes] = await Promise.all([
      auditor.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
      auditor.getByTestId("register-submit").click(),
    ]);
    await expect(auditor).toHaveURL(/\/verificar-email/);
    // verify for real — this test targets the read_only gate specifically,
    // not the unrelated email-verification gate.
    const regBody = await regRes.json();
    await auditor.request.get(`/verificar-email/${regBody.verifyTestToken}`);
    await auditor.goto("/panel");

    // the owner sees the new member already tagged "Solo lectura"
    await owner.goto("/panel/equipo");
    await expect(owner.getByTestId("member-list")).toContainText("Solo lectura");

    // the auditor can view the shared history (view is allowed)
    await auditor.goto("/panel/historico");
    await expect(auditor.getByTestId("historico-table")).toContainText(
      "ALMACÉN SEVILLA — SEVILLA → ALMACÉN BILBAO — BILBAO",
    );

    // but /crear shows the read-only gate, never the wizard
    await auditor.goto("/crear");
    await expect(auditor.getByRole("heading", { name: "Tu rol es de solo lectura" })).toBeVisible();
    await expect(auditor.locator("#shipperName")).toHaveCount(0);

    // and the panel home hides the create/duplicate actions
    await auditor.goto("/panel");
    await expect(auditor.getByTestId("app-crear")).toHaveCount(0);

    // server-side: a direct API call is rejected regardless of any UI gate
    const apiRes = await auditor.request.post("/api/deca", {
      data: {
        shipper: { name: "X", nif: "B1", address: "A" },
        carrier: { name: "Y", nif: "B2", address: "B" },
      },
    });
    expect(apiRes.status()).toBe(403);
    expect((await apiRes.json()).error.code).toBe("forbidden");

    await ownerCtx.close();
    await auditorCtx.close();
  });

  test("invite token cannot create a second company; an unknown/expired token is rejected", async ({
    request,
  }) => {
    const r = await request.post("/api/auth/register", {
      data: {
        email: email(),
        password: "Supersecret123!",
        acceptTerms: true,
        invite: "totally-invalid-token-000000000000",
      },
    });
    expect(r.status()).toBe(409); // AuthError → bad_input mapped to 409 by the route
  });

  test("PRODUCT #56: the owner's panel home shows recent team activity; a member's does not", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    await owner.goto("/panel/equipo");
    const memberEmail = email();
    await owner.fill('[data-testid="invite-email"]', memberEmail);
    await Promise.all([
      owner.waitForResponse(
        (r) => r.url().includes("/api/team/invites") && r.request().method() === "POST",
      ),
      owner.getByTestId("invite-submit").click(),
    ]);
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    // The owner's own dashboard shows the invite as team activity.
    await owner.goto("/panel");
    await expect(owner.getByTestId("team-activity")).toContainText("envió una invitación");

    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await member.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await member.fill("#email", memberEmail);
    await member.fill("#password", "Supersecret123!");
    await member.getByTestId("register-submit").click();
    await expect(member).toHaveURL(/\/verificar-email/);

    // The owner's dashboard now also shows the join.
    await owner.goto("/panel");
    await expect(owner.getByTestId("team-activity")).toContainText("se unió al equipo");

    // A regular member never sees this section at all (owner-only widget).
    await member.goto("/panel");
    await expect(member.getByTestId("team-activity")).toHaveCount(0);

    await ownerCtx.close();
    await memberCtx.close();
  });

  test("#102 follow-up: re-inviting the same email rotates the link — only the latest one works", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    const inviteEmail = email();

    // First invite.
    await owner.goto("/panel/equipo");
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const firstLink = (await owner.getByTestId("invite-link").textContent())!.trim();

    // Re-invite the SAME email — this used to create a second, independent
    // token; both links stayed valid and nothing told the admin which one
    // was current (the exact shape of a live report). Now it rotates the
    // same pending invite in place.
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const secondLink = (await owner.getByTestId("invite-link").textContent())!.trim();
    expect(secondLink).not.toBe(firstLink);

    // Exactly one pending invite is shown, never two.
    await expect(owner.getByTestId("pending-invites").locator("li")).toHaveCount(1);

    // The FIRST (superseded) link no longer resolves to a valid invite.
    const staleCtx = await browser.newContext();
    const stalePage = await staleCtx.newPage();
    await stalePage.goto(firstLink.replace(/^https?:\/\/[^/]+/, ""));
    await expect(stalePage.getByRole("heading", { name: /no v.lida|inv.lida/i })).toBeVisible();
    await staleCtx.close();

    // The SECOND (current) link works.
    const freshCtx = await browser.newContext();
    const freshPage = await freshCtx.newPage();
    await freshPage.goto(secondLink.replace(/^https?:\/\/[^/]+/, ""));
    await expect(freshPage.getByRole("heading", { name: "Únete al equipo" })).toBeVisible();
    await freshCtx.close();

    await ownerCtx.close();
  });

  test('D-176: clicking "Reenviar" on a pending invite shows the NEW working link', async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);
    const inviteEmail = email();

    await owner.goto("/panel/equipo");
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const firstLink = (await owner.getByTestId("invite-link").textContent())!.trim();

    // D-176 — the reported bug: "Reenviar" rotates the invite's token (same
    // mechanism as re-inviting, above) but used to throw the response away
    // entirely, leaving the admin with no way to see the new link short of
    // the email actually arriving. Every click silently invalidated
    // whatever link was on screen — "I generate a new one and it's always
    // expired", exactly as reported.
    await Promise.all([
      owner.waitForResponse(
        (r) => r.url().includes("/api/team/invites") && r.request().method() === "POST",
      ),
      owner.getByTestId(`resend-invite-${inviteEmail}`).click(),
    ]);
    await expect(owner.getByTestId("invite-link")).toBeVisible();
    const resentLink = (await owner.getByTestId("invite-link").textContent())!.trim();
    expect(resentLink).not.toBe(firstLink);

    // The link "Reenviar" just showed actually works.
    const freshCtx = await browser.newContext();
    const freshPage = await freshCtx.newPage();
    await freshPage.goto(resentLink.replace(/^https?:\/\/[^/]+/, ""));
    await expect(freshPage.getByRole("heading", { name: "Únete al equipo" })).toBeVisible();
    await freshCtx.close();

    // The link shown before the resend is now correctly superseded.
    const staleCtx = await browser.newContext();
    const stalePage = await staleCtx.newPage();
    await stalePage.goto(firstLink.replace(/^https?:\/\/[^/]+/, ""));
    await expect(stalePage.getByRole("heading", { name: /no v.lida|inv.lida/i })).toBeVisible();
    await staleCtx.close();

    await ownerCtx.close();
  });

  test("#124 an invite link cannot be redeemed by registering under a different email", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);

    await owner.goto("/panel/equipo");
    const inviteEmail = email();
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    // An attacker who obtains the link (forwarded, shared device, leaked
    // support ticket) tries to register under THEIR OWN email instead of the
    // one the invite was issued for.
    const attackerCtx = await browser.newContext();
    const attacker = await attackerCtx.newPage();
    await attacker.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    const attackerEmail = email();
    await attacker.fill("#email", attackerEmail);
    await attacker.fill("#password", "Supersecret123!");
    const [res] = await Promise.all([
      attacker.waitForResponse((r) => r.url().includes("/api/auth/register")),
      attacker.getByTestId("register-submit").click(),
    ]);
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe("invite_email_mismatch");
    // Never silently created an account joined to the target company.
    await expect(attacker).not.toHaveURL(/\/verificar-email/);

    // The invite is untouched — still pending, still redeemable by its real
    // recipient — never silently consumed by the mismatched attempt.
    await owner.goto("/panel/equipo");
    await expect(owner.getByTestId("pending-invites")).toContainText(inviteEmail);

    await ownerCtx.close();
    await attackerCtx.close();
  });

  test("#124 an invite link cannot be redeemed by an already-logged-in different-email account", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await registerOwner(owner);

    await owner.goto("/panel/equipo");
    const inviteEmail = email();
    await owner.fill('[data-testid="invite-email"]', inviteEmail);
    await owner.getByTestId("invite-submit").click();
    await expect(owner.getByTestId("invite-msg")).toContainText(inviteEmail);
    const link = (await owner.locator("p.font-mono").first().textContent())!.trim();

    // A second, unrelated company/account obtains the link and — already
    // logged in as themselves — visits it directly.
    const attackerCtx = await browser.newContext();
    const attacker = await attackerCtx.newPage();
    const attackerAddr = await registerOwner(attacker, email(), "Otra Empresa SL");
    await attacker.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(attacker).toHaveURL("/panel"); // existing no-error-shown redirect, unchanged

    // Never joined the target company: still only a member of their own.
    await expect(attacker.locator("h1")).toContainText("Otra Empresa SL");
    await expect(attacker.locator("h1")).not.toContainText("Agencia Equipo SL");

    // The invite is untouched — still pending for its real recipient.
    await owner.goto("/panel/equipo");
    await expect(owner.getByTestId("pending-invites")).toContainText(inviteEmail);
    await expect(owner.getByTestId("member-list")).not.toContainText(attackerAddr);

    await ownerCtx.close();
    await attackerCtx.close();
  });
});
