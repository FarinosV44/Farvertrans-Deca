import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { backupPasswordConfigured, checkBackupPassword } from "@/lib/admin/backup-password";

describe("Super Admin backup password (#91)", () => {
  const OLD = process.env.SUPERADMIN_BACKUP_PASSWORD;
  beforeEach(() => {
    process.env.SUPERADMIN_BACKUP_PASSWORD = "  correct horse battery staple  ";
  });
  afterEach(() => {
    process.env.SUPERADMIN_BACKUP_PASSWORD = OLD;
  });

  it("reports configured / not configured", () => {
    expect(backupPasswordConfigured()).toBe(true);
    process.env.SUPERADMIN_BACKUP_PASSWORD = "";
    expect(backupPasswordConfigured()).toBe(false);
    delete process.env.SUPERADMIN_BACKUP_PASSWORD;
    expect(backupPasswordConfigured()).toBe(false);
  });

  it("accepts the exact (trimmed) password, rejects everything else", () => {
    expect(checkBackupPassword("correct horse battery staple")).toBe(true);
    expect(checkBackupPassword("Correct Horse Battery Staple")).toBe(false);
    expect(checkBackupPassword("correct horse battery stapl")).toBe(false);
    expect(checkBackupPassword("")).toBe(false);
    expect(checkBackupPassword("x")).toBe(false);
  });

  it("rejects when nothing is configured", () => {
    process.env.SUPERADMIN_BACKUP_PASSWORD = "";
    expect(checkBackupPassword("anything")).toBe(false);
  });
});
