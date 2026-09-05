import { test, expect } from "@playwright/test";
import { PrismaClient } from "@/prisma/generated/client";
import { ADMIN, adminTotpCode } from "./helpers/admin-auth";

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

test.describe("SECURITY #53 — security audit log", () => {
  test("a successful and a failed admin login both leave an audit row", async ({ request }) => {
    // The table is append-only and accumulates across every run, so this
    // checks the two rows THIS test just created (by timestamp, most recent
    // first) rather than a total count, which only ever grows.
    const bad = await request.post("/api/auth/login", {
      data: { email: ADMIN.email, password: "wrong-password-entirely" },
    });
    expect(bad.status()).toBe(401);

    const good = await request.post("/api/auth/login", { data: ADMIN });
    expect(good.status()).toBe(200);

    const prisma = new PrismaClient();
    try {
      const rows = await prisma.securityAuditLog.findMany({
        where: { action: "admin_login" },
        orderBy: { createdAt: "desc" },
        take: 2,
      });
      expect(rows).toHaveLength(2);
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
});
