import type { CDPSession, Page } from "@playwright/test";
import { scryptSync, randomBytes } from "node:crypto";
import { PrismaClient } from "@/prisma/generated/client";

// `lib/prisma.ts` imports `server-only`, which throws outside Next's build —
// e2e tests run under plain Node, so they talk to the DB via a raw
// `PrismaClient` directly, same as `prisma/seed.ts` does.
const prisma = new PrismaClient();

/**
 * A CDP virtual authenticator that auto-approves every registration/
 * authentication ceremony (SECURITY #53 passkey follow-up e2e coverage) —
 * stands in for Face ID/Touch ID/Windows Hello, which no CI browser has.
 * `automaticPresenceSimulation: true` means no separate "tap to confirm"
 * step is needed; the browser resolves `navigator.credentials.*` as soon
 * as it's called.
 */
export async function addVirtualAuthenticator(
  page: Page,
): Promise<{ client: CDPSession; authenticatorId: string }> {
  const client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");
  const { authenticatorId } = await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  return { client, authenticatorId };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
}

/**
 * A brand-new internal-role user with NO strong auth enrolled yet — lets a
 * test exercise the real first-time "Protege tu cuenta de administrador"
 * setup screen instead of the pre-enrolled seeded `ADMIN` fixture.
 */
export async function createFreshInternalUser(): Promise<{ email: string; password: string }> {
  const email = `tpasskey${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
  const password = "Supersecret123!";
  await prisma.user.create({
    data: {
      authUserId: `local:test-${email}`,
      email,
      passwordHash: hashPassword(password),
      role: "internal",
    },
  });
  return { email, password };
}
