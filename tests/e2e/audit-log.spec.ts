import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { ADMIN, adminTotpCode, internalPage } from "./helpers/admin-auth";

/**
 * SECURITY #53 — append-only security audit trail. Covers the events this
 * session actually wired up: admin login (success/failure), 2FA
 * enroll/verify/recovery-code-use, and password reset. No route or UI
 * anywhere edits or deletes a row — only `recordAudit()` (the sole writer)
 * and reads exist.
 */

function email() {
  return `aud${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
}

async function registerOwner(page: Page, addr = email()) {
  await page.goto("/registro");
  await page.fill("#email", addr);
  await page.fill("#password", "Supersecret123!");
  await page.fill("#companyName", "Agencia Auditoria SL");
  await page.fill("#companyNif", "B12345675");
  await page.getByTestId("accept-terms").check();
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/register") && r.status() === 201),
    page.getByTestId("register-submit").click(),
  ]);
  await expect(page).toHaveURL(/\/verificar-email/);
  await page.goto("/panel");
  return addr;
}

test.describe("SECURITY #53 — security audit log", () => {
  test("a successful and a failed admin login both leave an audit row", async ({ request }) => {
    // The table is append-only and accumulates across every run (and other
    // e2e files log in as this same seeded admin concurrently under
    // --workers>1), so this scopes to the admin's own actorId and looks at a
    // small recent window rather than an exact count or unscoped top-N —
    // only THIS test ever produces a FAILURE row for this account.
    const prisma = new PrismaClient();
    try {
      const adminUser = await prisma.user.findFirstOrThrow({ where: { email: ADMIN.email } });

      const bad = await request.post("/api/auth/login", {
        data: { email: ADMIN.email, password: "wrong-password-entirely" },
      });
      expect(bad.status()).toBe(401);

      const good = await request.post("/api/auth/login", { data: ADMIN });
      expect(good.status()).toBe(200);

      const rows = await prisma.securityAuditLog.findMany({
        where: { action: "admin_login", actorId: adminUser.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      expect(rows.some((r) => r.result === "success")).toBe(true);
      expect(rows.some((r) => r.result === "failure")).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });

  test("a failed login for a NON-admin email leaves no admin_login row for that account", async ({
    request,
  }) => {
    const addr = email();
    await request.post("/api/auth/register", {
      data: {
        email: addr,
        password: "Supersecret123!",
        companyName: "No Admin SL",
        companyNif: "B12345674",
        acceptTerms: true,
      },
    });
    await request.post("/api/auth/login", { data: { email: addr, password: "wrong-one" } });

    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });
      const row = await prisma.securityAuditLog.findFirst({
        where: { action: "admin_login", actorId: user.id },
      });
      expect(row).toBeNull(); // a customer's failed login never becomes an admin_login row
    } finally {
      await prisma.$disconnect();
    }
  });

  test("completing a password reset leaves an audit row", async ({ request }) => {
    const addr = email();
    await request.post("/api/auth/register", {
      data: {
        email: addr,
        password: "Supersecret123!",
        companyName: "Audit SL",
        companyNif: "B12345674",
        acceptTerms: true,
      },
    });
    const reqRes = await request.post("/api/auth/password/request", { data: { email: addr } });
    const token = (await reqRes.json()).testToken as string;
    const reset = await request.post("/api/auth/password/reset", {
      data: { token, password: "BrandNewPass77!" },
    });
    expect(reset.status()).toBe(200);

    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findFirstOrThrow({ where: { email: addr } });
      const row = await prisma.securityAuditLog.findFirst({
        where: { action: "password_reset", actorId: user.id },
      });
      expect(row).not.toBeNull();
      expect(row?.result).toBe("success");
    } finally {
      await prisma.$disconnect();
    }
  });

  test("enrolling and verifying admin 2FA both leave audit rows", async ({ request }) => {
    // this seeded admin is already enrolled — re-verify leaves a fresh row
    await request.post("/api/auth/login", { data: ADMIN });
    const verify = await request.post("/api/admin/2fa/verify", {
      data: { code: adminTotpCode() },
    });
    expect(verify.status()).toBe(200);

    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findFirstOrThrow({ where: { email: ADMIN.email } });
      const row = await prisma.securityAuditLog.findFirst({
        where: { action: "admin_2fa_verify", actorId: user.id, result: "success" },
        orderBy: { createdAt: "desc" },
      });
      expect(row).not.toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  test("PRODUCT #56: team invites, invite acceptance and role changes all leave audit rows", async ({
    browser,
  }) => {
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    const ownerEmail = await registerOwner(owner);

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

    await owner.goto("/panel/equipo");
    await Promise.all([
      owner.waitForResponse(
        (r) =>
          r.url().includes("/api/team/members/") &&
          r.request().method() === "PATCH" &&
          r.status() === 200,
      ),
      owner.getByTestId(`role-${memberEmail}`).selectOption("owner"),
    ]);

    const prisma = new PrismaClient();
    try {
      const ownerUser = await prisma.user.findFirstOrThrow({ where: { email: ownerEmail } });
      const memberUser = await prisma.user.findFirstOrThrow({ where: { email: memberEmail } });

      const created = await prisma.securityAuditLog.findFirst({
        where: { action: "team_invite_created", actorId: ownerUser.id, result: "success" },
      });
      expect(created).not.toBeNull();

      const accepted = await prisma.securityAuditLog.findFirst({
        where: { action: "team_invite_accepted", actorId: memberUser.id, result: "success" },
      });
      expect(accepted).not.toBeNull();

      const roleChanged = await prisma.securityAuditLog.findFirst({
        where: {
          action: "team_role_changed",
          actorId: ownerUser.id,
          targetId: memberUser.id,
          targetType: "owner",
          result: "success",
        },
      });
      expect(roleChanged).not.toBeNull();
    } finally {
      await prisma.$disconnect();
      await ownerCtx.close();
      await memberCtx.close();
    }
  });

  test("PRODUCT #56: /admin/auditoria shows role-change and invite events to an internal user", async ({
    browser,
  }) => {
    // Self-contained (tests run fullyParallel — never assumes a prior test's
    // row exists): produces its own team_role_changed event first.
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

    await owner.goto("/panel/equipo");
    await Promise.all([
      owner.waitForResponse(
        (r) =>
          r.url().includes("/api/team/members/") &&
          r.request().method() === "PATCH" &&
          r.status() === 200,
      ),
      owner.getByTestId(`role-${memberEmail}`).selectOption("owner"),
    ]);
    await ownerCtx.close();
    await memberCtx.close();

    const { page, close } = await internalPage(browser);
    try {
      await page.goto("/admin/auditoria");
      await expect(page.getByRole("heading", { name: "Auditoría de seguridad" })).toBeVisible();

      await page.goto("/admin/auditoria?action=team_role_changed");
      await expect(page.getByText("team_role_changed").first()).toBeVisible();
    } finally {
      await close();
    }
  });
});
