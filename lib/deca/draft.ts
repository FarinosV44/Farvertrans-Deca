import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * A single in-progress DeCA per user (#76). The wizard upserts it as the user
 * types; it holds only the flat form state and never a token/PDF/URL. On
 * generation the real `Deca` is created and the draft is deleted.
 */

const MAX_JSON = 12_000; // the flat wizard form is ~1.5KB; cap defensively

export type DraftData = Record<string, unknown>;

/** Country defaults the empty form ships with — not "content" on their own. */
const NON_CONTENT_KEYS = new Set(["loadLocationCountry", "unloadLocationCountry"]);

export function draftHasContent(data: DraftData): boolean {
  return Object.entries(data).some(
    ([k, v]) => typeof v === "string" && v.trim() !== "" && !NON_CONTENT_KEYS.has(k),
  );
}

/** Compact human label for the panel banner — never raw field names. */
export function draftRouteLabel(data: DraftData): string {
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const from = s(data.loadLocationCity) || s(data.loadLocationName);
  const to = s(data.unloadLocationCity) || s(data.unloadLocationName);
  if (from || to) return `${from || "—"} → ${to || "—"}`;
  return "Borrador de DeCA";
}

export async function getDraft(userId: string) {
  return prisma.decaDraft.findUnique({ where: { userId } });
}

/**
 * Upsert the user's single draft. If the payload holds nothing worth keeping
 * (the untouched empty form), the draft is removed instead — no empty drafts.
 */
export async function saveDraft(userId: string, companyId: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data ?? {});
  if (json.length > MAX_JSON) throw new Error("draft_too_large");
  const parsed = JSON.parse(json) as DraftData;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad_draft");

  if (!draftHasContent(parsed)) {
    await prisma.decaDraft.deleteMany({ where: { userId } });
    return;
  }
  const dataJson = parsed as unknown as object;
  await prisma.decaDraft.upsert({
    where: { userId },
    create: { userId, companyId, dataJson },
    update: { dataJson },
  });
}

export async function discardDraft(userId: string): Promise<void> {
  await prisma.decaDraft.deleteMany({ where: { userId } });
}
