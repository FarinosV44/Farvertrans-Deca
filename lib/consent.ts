import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Commercial route-offer consent (DATA #45 §3) — separate from the mandatory
 * `TermsAcceptance`. Opt-in, not pre-checked, revocable, auditable
 * (granted_at/revoked_at + the copy version shown when granted).
 */

export const COMMERCIAL_CONSENT_VERSION = "2026-09-05";

export type CommercialConsentState = {
  granted: boolean;
  version: string | null;
  grantedAt: Date | null;
  revokedAt: Date | null;
};

export async function getCommercialConsent(companyId: string): Promise<CommercialConsentState> {
  const row = await prisma.commercialConsent.findUnique({ where: { companyId } });
  if (!row) return { granted: false, version: null, grantedAt: null, revokedAt: null };
  return {
    granted: row.granted,
    version: row.version,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
  };
}

export async function setCommercialConsent(
  companyId: string,
  granted: boolean,
): Promise<CommercialConsentState> {
  const now = new Date();
  const row = await prisma.commercialConsent.upsert({
    where: { companyId },
    create: {
      companyId,
      granted,
      version: COMMERCIAL_CONSENT_VERSION,
      grantedAt: granted ? now : null,
      revokedAt: granted ? null : now,
    },
    update: granted
      ? { granted: true, version: COMMERCIAL_CONSENT_VERSION, grantedAt: now, revokedAt: null }
      : { granted: false, revokedAt: now },
  });
  return {
    granted: row.granted,
    version: row.version,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
  };
}
