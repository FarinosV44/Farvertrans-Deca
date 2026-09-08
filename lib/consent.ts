import "server-only";
import { prisma } from "@/lib/prisma";
import {
  sharedFieldKeys,
  type CommercialConsentMode,
  type CommercialContactChannel,
  type CommercialTreatmentState,
  type SharedFieldKey,
} from "@/lib/commercial/types";

/**
 * Commercial-treatment preference (#84, evolving DATA #45 §3) — separate from
 * the mandatory `TermsAcceptance`. Opt-in, granular (`none` / `per_deca` /
 * `all`), revocable, and audited: every change and every prepared/withdrawn
 * availability record is appended to `CommercialConsentEvent`. Free use of the
 * product is never conditioned on this — `none` is the normal default.
 *
 * Nothing here transmits anything to a third party: there is no recipient side
 * yet. `all` / `per_deca` only cause a `DecaAvailabilityShare` row to be
 * prepared (see `lib/commercial/availability.ts`).
 */

/**
 * Legal-text version in force for the commercial treatment. Bumped together
 * with the new privacy/terms sections (#84, Slice 4) so every stored consent
 * and availability record names the exact text the operator agreed to.
 */
export const COMMERCIAL_CONSENT_VERSION = "2026-09-15";

export {
  sharedFieldKeys,
  type CommercialConsentMode,
  type CommercialContactChannel,
  type CommercialTreatmentState,
  type SharedFieldKey,
};

const EMPTY: CommercialTreatmentState = {
  mode: "none",
  channel: null,
  contactEmail: null,
  contactPhone: null,
  version: null,
  grantedAt: null,
  revokedAt: null,
  updatedAt: null,
};

type ConsentRow = {
  mode: CommercialConsentMode;
  channel: CommercialContactChannel | null;
  contactEmail: string | null;
  contactPhone: string | null;
  version: string;
  grantedAt: Date | null;
  revokedAt: Date | null;
  updatedAt: Date;
};

function toState(row: ConsentRow): CommercialTreatmentState {
  return {
    mode: row.mode,
    channel: row.channel,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    version: row.version,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Reads never crash the page they back (D-041): a schema mismatch degrades to
 * the safe "none" default instead of an error boundary. The real error is
 * still logged so the gap stays diagnosable.
 */
export async function getCommercialTreatment(companyId: string): Promise<CommercialTreatmentState> {
  try {
    const row = await prisma.commercialConsent.findUnique({ where: { companyId } });
    return row ? toState(row as ConsentRow) : EMPTY;
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "commercial_consent_read_failed",
        companyId,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
    return EMPTY;
  }
}

/** Normalise the contact values so only the selected channel's value is kept. */
function contactsFor(
  channel: CommercialContactChannel,
  email: string | null | undefined,
  phone: string | null | undefined,
): { contactEmail: string | null; contactPhone: string | null } {
  return {
    contactEmail: channel === "phone" ? null : email?.trim() || null,
    contactPhone: channel === "email" ? null : phone?.trim() || null,
  };
}

/**
 * Append a commercial-treatment event. Best-effort — an audit write must never
 * block the action it records (same rule as `recordAudit`). Exported so
 * `lib/commercial/availability.ts` records `availability_*` through one path.
 */
export async function recordCommercialEvent(e: {
  companyId: string;
  actorUserId: string | null;
  kind:
    | "mode_set"
    | "channel_set"
    | "per_deca_enabled"
    | "per_deca_disabled"
    | "global_revoked"
    | "availability_prepared"
    | "availability_withdrawn";
  decaId?: string | null;
  mode?: CommercialConsentMode | null;
  channel?: CommercialContactChannel | null;
  detail?: unknown;
}): Promise<void> {
  try {
    await prisma.commercialConsentEvent.create({
      data: {
        companyId: e.companyId,
        actorUserId: e.actorUserId,
        kind: e.kind,
        decaId: e.decaId ?? null,
        mode: e.mode ?? null,
        channel: e.channel ?? null,
        legalVersion: COMMERCIAL_CONSENT_VERSION,
        detail: e.detail === undefined ? undefined : (e.detail as object),
      },
    });
  } catch {
    // never block the audited action on an audit-log hiccup
  }
}

export async function setCommercialMode(
  companyId: string,
  mode: CommercialConsentMode,
  actorUserId: string | null,
): Promise<CommercialTreatmentState> {
  const now = new Date();
  const goingNone = mode === "none";
  const row = await prisma.commercialConsent.upsert({
    where: { companyId },
    create: {
      companyId,
      mode,
      version: COMMERCIAL_CONSENT_VERSION,
      grantedAt: goingNone ? null : now,
      revokedAt: goingNone ? now : null,
    },
    update: goingNone
      ? { mode, revokedAt: now }
      : { mode, version: COMMERCIAL_CONSENT_VERSION, grantedAt: now, revokedAt: null },
  });
  await recordCommercialEvent({
    companyId,
    actorUserId,
    kind: goingNone ? "global_revoked" : "mode_set",
    mode,
  });
  return toState(row as ConsentRow);
}

export async function setCommercialChannel(
  companyId: string,
  input: {
    channel: CommercialContactChannel;
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
  actorUserId: string | null,
): Promise<CommercialTreatmentState> {
  const contacts = contactsFor(input.channel, input.contactEmail, input.contactPhone);
  const row = await prisma.commercialConsent.upsert({
    where: { companyId },
    create: {
      companyId,
      mode: "none",
      version: COMMERCIAL_CONSENT_VERSION,
      channel: input.channel,
      ...contacts,
    },
    update: { channel: input.channel, ...contacts },
  });
  await recordCommercialEvent({
    companyId,
    actorUserId,
    kind: "channel_set",
    channel: input.channel,
  });
  return toState(row as ConsentRow);
}

/** Retire the global authorisation immediately (future porte communications only). */
export async function revokeCommercial(
  companyId: string,
  actorUserId: string | null,
): Promise<CommercialTreatmentState> {
  return setCommercialMode(companyId, "none", actorUserId);
}
