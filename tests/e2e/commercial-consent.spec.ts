import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * #84 — granular commercial-treatment consent: the settings surface
 * (registration opt-in + /panel/privacidad) and the per-DeCA capture, covering
 * the issue's 8 minimum test cases.
 */

const prisma = new PrismaClient();

function email() {
  return `cc84${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

/**
 * The availability record for a DeCA (the /crear/[id] segment is the deca id).
 * `recordAvailabilityShare` runs fire-and-forget after the 201, so poll briefly.
 */
async function availabilityFor(decaId: string, { expectRow = true } = {}) {
  for (let i = 0; i < 25; i++) {
    const row = await prisma.decaAvailabilityShare.findUnique({ where: { decaId } });
    if (row) return row;
    if (!expectRow && i >= 8) return null; // ~800ms with no row is conclusive
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

/** The current public token for a DeCA. */
async function publicToken(decaId: string) {
  const v = await prisma.decaVersion.findFirst({
    where: { decaId },
    orderBy: { versionNo: "desc" },
    select: { token: true },
  });
  return v?.token ?? "";
}

const DECA = {
  shipperName: "Cargas del Turia SL",
  shipperNif: "B96789011",
  shipperAddress: "Av. del Puerto 120, Valencia",
  carrierName: "Transportes Pérez SL",
  carrierNif: "B12345674",
  carrierAddress: "Pol. Ind. Fuente del Jarro 5, Paterna",
  goods: "Palés de cerámica",
  weight: "12.500 kg",
  tractorPlate: "1234 BCD",
};

async function fillWizardToStep3(page: Page) {
  await page.goto("/crear");
  await page.fill("#shipperName", DECA.shipperName);
  await page.fill("#shipperNif", DECA.shipperNif);
  await page.fill("#shipperAddress", DECA.shipperAddress);
  await page.fill("#carrierName", DECA.carrierName);
  await page.fill("#carrierNif", DECA.carrierNif);
  await page.fill("#carrierAddress", DECA.carrierAddress);
  await page.getByTestId("wizard-next").click();
  await page.fill("#loadLocationName", "Almacén Turia");
  await page.fill("#loadLocationAddress", "Av. del Puerto 120");
  await page.fill("#loadLocationPostalCode", "46023");
  await page.fill("#loadLocationCity", "Valencia");
  await page.fill("#loadLocationCountry", "España");
  await page.fill("#loadDate", "2026-10-06");
  await page.fill("#unloadLocationName", "Plataforma Norte");
  await page.fill("#unloadLocationAddress", "Calle Alcalá 200");
  await page.fill("#unloadLocationPostalCode", "28028");
  await page.fill("#unloadLocationCity", "Madrid");
  await page.fill("#unloadLocationCountry", "España");
  await page.fill("#unloadDate", "2026-10-07");
  await page.getByTestId("wizard-next").click();
  await page.fill("#goods", DECA.goods);
  await page.fill("#weight", DECA.weight);
  await page.fill("#tractorPlate", DECA.tractorPlate);
}

/** Generate the DeCA and return its deca id (the /crear/[id] segment). */
async function generate(page: Page): Promise<string> {
  await page.getByTestId("wizard-generate").click();
  await expect(page).toHaveURL(/\/crear\/[a-z0-9]+/i);
  return page.url().split("/crear/")[1].split("?")[0];
}

async function register(page: Page, opts: { commercialOptIn?: boolean } = {}) {
  await page.goto("/registro");
  await page.fill("#email", email());
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Consentimiento SL");
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("accept-terms").check();
  if (opts.commercialOptIn) await page.getByTestId("commercial-opt-in").check();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
}

/**
 * Put `page` in the exact state a fresh Google sign-up leaves a user in: a
 * logged-in account with NO company, sitting on `/registro/completar-empresa`.
 * We reach it without real Google OAuth by registering the user into a team,
 * having the owner remove them, then logging back in (the one legitimate
 * "no company" outcome) — the same code path the Google callback lands on.
 */
async function companylessOnboarding(
  page: Page,
  browser: import("@playwright/test").Browser,
): Promise<string> {
  const owner = await browser.newContext();
  const op = await owner.newPage();
  await register(op); // owner + their company
  const target = `g${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
  const inv = await op.request.post("/api/team/invites", {
    data: { email: target, role: "member" },
  });
  const link = (await inv.json()).link as string;
  const token = new URL(link).searchParams.get("invite")!;

  await page.goto(`/registro?invite=${token}`);
  await page.fill("#email", target);
  await page.fill("#password", "Supersecret123!");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await page.goto("/panel");

  await op.goto("/panel/equipo");
  op.once("dialog", (d) => d.accept());
  await op.getByTestId(`remove-member-${target}`).click();
  await expect(op.getByTestId("member-list")).not.toContainText(target);
  await owner.close();

  await page.goto("/entrar");
  await page.fill("#email", target);
  await page.fill("#password", "Supersecret123!");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.status() === 200),
    page.getByTestId("register-submit").click(),
  ]);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/registro\/completar-empresa$/);
  return target;
}

async function completeCompany(page: Page, opts: { commercialOptIn?: boolean } = {}) {
  await page.fill("#companyName", "Empresa Google SL");
  await page.fill("#companyNif", "B12345674");
  await page.fill("#companyContactName", "Ana Ejemplo");
  await page.fill("#companyPhone", "600111222");
  await page.fill("#companyEmail", "empresa-google@example.com");
  await page.fill("#companyAddress", "Calle Prueba 1");
  await page.fill("#companyPostalCode", "46540");
  await page.fill("#companyCity", "El Puig");
  await page.getByTestId("profile-carrier_goods").click();
  await page.getByTestId("accept-terms").check();
  if (opts.commercialOptIn) await page.getByTestId("commercial-opt-in").check();
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/auth/complete-company") && r.status() === 200,
    ),
    page.getByTestId("complete-company-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/panel$/);
}

test.describe("#84 / D-193 — Google onboarding offers the same opt-in", () => {
  test("the opt-in is present and unchecked by default on the Google company step", async ({
    page,
    browser,
  }) => {
    await companylessOnboarding(page, browser);
    await expect(page.getByTestId("commercial-opt-in-box")).toBeVisible();
    await expect(page.getByTestId("commercial-opt-in")).not.toBeChecked();
    // same DECA Conecta disclosure as the standard flow
    await expect(
      page.getByText("Cómo funciona DECA Conecta y qué datos se utilizan"),
    ).toBeVisible();
  });

  test("a Google user can finish onboarding WITHOUT the opt-in → mode 'none'", async ({
    page,
    browser,
  }) => {
    await companylessOnboarding(page, browser);
    await completeCompany(page); // opt-in left unchecked
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("a Google user can explicitly enable the opt-in → mode 'all', same as standard signup", async ({
    page,
    browser,
  }) => {
    await companylessOnboarding(page, browser);
    await completeCompany(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-all")).toBeChecked();
    await expect(page.getByTestId("commercial-preview")).toBeVisible();
    await expect(page.getByTestId("commercial-revoke")).toBeVisible();
  });

  test("a company-less user completing onboarding as a TEAM JOIN is not shown the opt-in", async ({
    page,
    browser,
  }) => {
    // first: a logged-in, company-less session (the Google-callback state)
    await companylessOnboarding(page, browser);
    // now an invite from a different company — the Google callback would land
    // them on completar-empresa?invite=<token>
    const other = await browser.newContext();
    const op = await other.newPage();
    await register(op);
    const inv = await op.request.post("/api/team/invites", {
      data: { email: `join${Date.now()}@example.com`, role: "member" },
    });
    const token = new URL((await inv.json()).link as string).searchParams.get("invite")!;
    await other.close();

    await page.goto(`/registro/completar-empresa?invite=${token}`);
    // joining a team: no company fields, no profile, and no opt-in — that
    // decision belongs to the company owner, not a joining member.
    await expect(page.getByTestId("complete-company-submit")).toBeVisible();
    await expect(page.getByTestId("commercial-opt-in-box")).toHaveCount(0);
  });
});

test.describe("#84 → DECA Conecta rename — the two consent surfaces", () => {
  test("registration card: DECA Conecta + OPCIONAL badge, unchecked, article link, no old name", async ({
    page,
  }) => {
    await page.goto("/registro");
    const box = page.getByTestId("commercial-opt-in-box");
    await expect(box).toContainText("DECA Conecta");
    await expect(box).toContainText("Tu destino puede conectarte con tu próxima carga.");
    await expect(box).not.toContainText("Oportunidades de carga");
    await expect(box).not.toContainText("Kilómetro Cero");
    await expect(page.getByTestId("commercial-opt-in")).not.toBeChecked();
    // discreet secondary link to the published article (real route, under /blog)
    await expect(page.getByTestId("commercial-opt-in-article")).toHaveAttribute(
      "href",
      "/blog/deca-conecta-ofertas-carga",
    );
    // expanded info renders the "No compartimos" list incl. GPS
    await box.locator("summary").first().click();
    await expect(box).toContainText("La ubicación GPS ni seguimiento en tiempo real.");
  });

  test("accepting Terms + Privacy alone does NOT activate DECA Conecta", async ({ page }) => {
    await page.goto("/registro");
    await page.fill("#email", email());
    await page.fill("#password", "Supersecret123!");
    await page.fill("#companyName", "Solo Legal SL");
    await page.fill("#companyNif", "B12345674");
    await page.fill("#companyContactName", "Ana Ejemplo");
    await page.fill("#companyPhone", "600111222");
    await page.fill("#companyEmail", "empresa@example.com");
    await page.fill("#companyAddress", "Calle Prueba 1");
    await page.fill("#companyPostalCode", "46540");
    await page.fill("#companyCity", "El Puig");
    await page.getByTestId("accept-terms").check(); // ONLY the required legal box
    await expect(page.getByTestId("commercial-opt-in")).not.toBeChecked();
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
      page.getByTestId("register-submit").click(),
    ]);
    await page.request.get(`/verificar-email/${(await res.json()).verifyTestToken}`);
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("privacy page: 'Privacidad' title, DECA Conecta card, 3 stored modes, article link, no old title", async ({
    page,
  }) => {
    await register(page);
    await page.goto("/panel/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Privacidad" })).toBeVisible();
    const section = page.locator("section[aria-labelledby='deca-conecta']");
    await expect(section.getByRole("heading", { name: "DECA Conecta" })).toBeVisible();
    await expect(section).toContainText("¿Cuándo quieres activar DECA Conecta?");
    // the visible feature title is no longer "Tratamiento comercial"
    await expect(section.getByRole("heading", { name: "Tratamiento comercial" })).toHaveCount(0);
    // the 3 stored preference values are unchanged, "none" is the default
    await expect(page.getByTestId("mode-none")).toBeChecked();
    await expect(page.getByTestId("mode-per_deca")).toBeVisible();
    await expect(page.getByTestId("mode-all")).toBeVisible();
    // disclosure carries the recipients/purpose/revocation and the exclusion list
    await page.getByTestId("deca-conecta-disclosure").locator("summary").click();
    await expect(page.getByTestId("deca-conecta-disclosure")).toContainText("Destinatarios:");
    await expect(page.getByTestId("deca-conecta-disclosure")).toContainText("Finalidad:");
    await expect(page.getByTestId("deca-conecta-disclosure")).toContainText("Revocación:");
    await expect(page.getByTestId("deca-conecta-disclosure")).toContainText(
      "La ubicación GPS ni seguimiento en tiempo real.",
    );
    await expect(page.getByTestId("deca-conecta-article")).toHaveAttribute(
      "href",
      "/blog/deca-conecta-ofertas-carga",
    );
  });

  test("both cards render without overflow on a phone and no raw i18n keys leak", async ({
    page,
  }) => {
    const noOverflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
    const noRawKeys = async (loc: import("@playwright/test").Locator) => {
      const txt = (await loc.textContent()) ?? "";
      // a missing key would render as e.g. "commercialOptIn.info.howBody" or "[object Object]"
      expect(txt).not.toMatch(/commercialOptIn\.|privacy\.disclosure|\[object Object\]/);
    };

    await page.setViewportSize({ width: 375, height: 1400 });
    await page.goto("/registro");
    const box = page.getByTestId("commercial-opt-in-box");
    await box.scrollIntoViewIfNeeded();
    await box.locator("summary").first().click();
    await noRawKeys(box);
    expect(await noOverflow()).toBeLessThanOrEqual(0);

    await register(page);
    await page.goto("/panel/privacidad");
    const section = page.locator("section[aria-labelledby='deca-conecta']");
    await page.getByTestId("deca-conecta-disclosure").locator("summary").click();
    await noRawKeys(section);
    expect(await noOverflow()).toBeLessThanOrEqual(0);
  });

  test("the DECA Conecta article link resolves (real published route)", async ({ page }) => {
    const res = await page.request.get("/blog/deca-conecta-ofertas-carga");
    // 200 when the CMS row exists (production / seeded), 404 otherwise — never a 500
    expect([200, 404]).toContain(res.status());
  });
});

test.describe("#84 — commercial-treatment settings", () => {
  test("registration checkbox is unchecked by default and never blocks signup", async ({
    page,
  }) => {
    await page.goto("/registro");
    await expect(page.getByTestId("commercial-opt-in")).not.toBeChecked();
    // sign up WITHOUT ticking it
    await register(page);
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("ticking the registration checkbox sets the global mode to 'all'", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await expect(page.getByTestId("mode-all")).toBeChecked();
    // and the exact-fields preview + revoke control are shown
    await expect(page.getByTestId("commercial-preview")).toBeVisible();
    await expect(page.getByTestId("commercial-revoke")).toBeVisible();
  });

  test("owner can move between the three modes and revoke; each persists", async ({ page }) => {
    await register(page);
    await page.goto("/panel/privacidad");
    const consentSaved = () =>
      page.waitForResponse((r) => r.url().includes("/api/company/consent") && r.ok());

    await Promise.all([consentSaved(), page.getByTestId("mode-per_deca").check()]);
    await page.reload();
    await expect(page.getByTestId("mode-per_deca")).toBeChecked();

    await Promise.all([consentSaved(), page.getByTestId("mode-all").check()]);
    await page.reload();
    await expect(page.getByTestId("mode-all")).toBeChecked();

    page.on("dialog", (d) => d.accept());
    await Promise.all([consentSaved(), page.getByTestId("commercial-revoke").click()]);
    await page.reload();
    await expect(page.getByTestId("mode-none")).toBeChecked();
  });

  test("channel 'email' hides the phone field and vice-versa", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    // #85 — the phone channel is labelled "WhatsApp", never "Teléfono"
    await expect(page.getByTestId("commercial-channel")).toContainText("WhatsApp");
    await expect(page.getByTestId("commercial-channel")).not.toContainText("Teléfono");
    await page.getByTestId("commercial-channel").selectOption("email");
    await expect(page.getByTestId("commercial-email")).toBeVisible();
    await expect(page.getByTestId("commercial-phone")).toHaveCount(0);
    await expect(page.getByTestId("commercial-preview")).toContainText(
      "Correo electrónico autorizado",
    );
    await page.getByTestId("commercial-channel").selectOption("phone");
    await expect(page.getByTestId("commercial-phone")).toBeVisible();
    await expect(page.getByTestId("commercial-email")).toHaveCount(0);
  });

  test("a non-owner member sees the setting read-only", async ({ browser }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    await register(owner);
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

    await member.goto("/panel/privacidad");
    await expect(member.getByTestId("mode-none")).toBeDisabled();
    await expect(member.getByText("Solo el administrador de la empresa")).toBeVisible();

    await ownerCtx.close();
    await memberCtx.close();
  });
});

test.describe("#84 — per-DeCA capture (the 8 minimum cases)", () => {
  test("1 · a new company shares nothing: no block in the wizard, no record", async ({ page }) => {
    await register(page);
    await fillWizardToStep3(page);
    await expect(page.getByTestId("commercial-share")).toHaveCount(0);
    const token = await generate(page);
    expect(await availabilityFor(token, { expectRow: false })).toBeNull();
  });

  test("2 · 'preguntarme': enable it on one porte, leave it off on another", async ({ page }) => {
    await register(page);
    await page.goto("/panel/privacidad");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/company/consent") && r.ok()),
      page.getByTestId("mode-per_deca").check(),
    ]);

    // porte A — enable
    await fillWizardToStep3(page);
    await expect(page.getByTestId("commercial-share-enable")).not.toBeChecked();
    await page.getByTestId("commercial-share-enable").check();
    const a = await generate(page);
    const rowA = await availabilityFor(a);
    expect(rowA?.status).toBe("pending");
    expect(rowA?.destination).toBe("Madrid");

    // porte B — leave it off
    await fillWizardToStep3(page);
    const b = await generate(page);
    expect(await availabilityFor(b, { expectRow: false })).toBeNull();
  });

  test("3 · 'todos': the box is pre-checked; unticking it on a porte prevents the record", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillWizardToStep3(page);
    await expect(page.getByTestId("commercial-share-enable")).toBeChecked();
    await page.getByTestId("commercial-share-enable").uncheck();
    const token = await generate(page);
    expect(await availabilityFor(token, { expectRow: false })).toBeNull();
  });

  test("4 · revoking the global authorisation before generating prevents the record", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await fillWizardToStep3(page);
    await expect(page.getByTestId("commercial-share-enable")).toBeChecked();
    // revoke out-of-band, box still ticked
    const res = await page.request.post("/api/company/consent", { data: { action: "revoke" } });
    expect(res.ok()).toBeTruthy();
    const token = await generate(page);
    expect(await availabilityFor(token, { expectRow: false })).toBeNull();
  });

  test("5 · channel 'email' only: the record carries the email, not the phone", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await page.getByTestId("commercial-channel").selectOption("email");
    await page.fill('[data-testid="commercial-email"]', "flota@perez.example");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/company/consent") && r.ok()),
      page.getByTestId("commercial-channel-save").click(),
    ]);
    await fillWizardToStep3(page);
    await expect(page.getByTestId("commercial-share-enable")).toBeChecked();
    const token = await generate(page);
    const row = await availabilityFor(token);
    expect(row?.channel).toBe("email");
    expect(row?.contactEmail).toBe("flota@perez.example");
    expect(row?.contactPhone).toBeNull();
  });

  test("6 · channel 'phone' only: the record carries the phone, not the email", async ({
    page,
  }) => {
    await register(page, { commercialOptIn: true });
    await page.goto("/panel/privacidad");
    await page.getByTestId("commercial-channel").selectOption("phone");
    await page.fill('[data-testid="commercial-phone"]', "600111222");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/company/consent") && r.ok()),
      page.getByTestId("commercial-channel-save").click(),
    ]);
    await fillWizardToStep3(page);
    const token = await generate(page);
    const row = await availabilityFor(token);
    expect(row?.channel).toBe("phone");
    expect(row?.contactPhone).toBe("600111222");
    expect(row?.contactEmail).toBeNull();
  });

  test("7 · declining still emits and keeps the DeCA, free, with no blocks", async ({ page }) => {
    await register(page);
    await fillWizardToStep3(page);
    const decaId = await generate(page);
    // the public document is reachable with no auth
    const pub = await page.request.get(`/d/${await publicToken(decaId)}`);
    expect(pub.status()).toBe(200);
  });

  test("8 · the prepared record contains no excluded data", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await fillWizardToStep3(page);
    const decaId = await generate(page);
    const row = await availabilityFor(decaId);
    expect(row).not.toBeNull();
    const serialised = JSON.stringify(row);
    for (const forbidden of [
      DECA.shipperName,
      DECA.shipperNif,
      "Av. del Puerto", // load address
      "Almacén Turia", // load establishment
      DECA.goods,
      "12.500",
      DECA.tractorPlate,
      await publicToken(decaId), // no public token
    ]) {
      expect(serialised, `leaked: ${forbidden}`).not.toContain(forbidden);
    }
    // it DOES carry exactly the four authorised things
    expect(row?.carrierName).toBe(DECA.carrierName);
    expect(row?.destination).toBe("Madrid");
    expect(row?.availabilityDate.toISOString().slice(0, 10)).toBe("2026-10-07");
  });

  test("the owner can withdraw a prepared record from the DeCA detail page", async ({ page }) => {
    await register(page, { commercialOptIn: true });
    await fillWizardToStep3(page);
    const decaId = await generate(page);
    await page.goto(`/panel/deca/${decaId}`);
    await expect(page.getByTestId("availability-notice")).toBeVisible();
    page.on("dialog", (d) => d.accept());
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/availability") && r.ok()),
      page.getByTestId("availability-withdraw").click(),
    ]);
    await expect(page.getByText("se retiró de las propuestas")).toBeVisible();
    expect((await availabilityFor(decaId))?.status).toBe("withdrawn");
  });
});
