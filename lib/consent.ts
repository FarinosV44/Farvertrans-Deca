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

const EMPTY_CONSENT: CommercialConsentState = {
  granted: false,
  version: null,
  grantedAt: null,
  revokedAt: null,
};

/**
 * Reads never crash the page they back: a schema mismatch (e.g. this
 * migration not yet applied on a given environment) degrades to the safe
 * "not granted" default instead of a generic error boundary, matching the
 * lesson from D-041 (unguarded Prisma calls taking down an entire page). The
 * real error is still logged so the gap is diagnosable, not silently masked.
 */
export async function getCommercialConsent(companyId: string): Promise<CommercialConsentState> {
  let row;
  try {
    row = await prisma.commercialConsent.findUnique({ where: { companyId } });
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "commercial_consent_read_failed",
        companyId,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
    return EMPTY_CONSENT;
  }
  if (!row) return EMPTY_CONSENT;
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
