import "server-only";
import { prisma } from "@/lib/prisma";
import {
  HISTORY_FILTER_KEYS,
  MAX_HISTORY_VIEWS,
  historyViewName,
  type HistoryFilters,
} from "@/lib/data/history-views";

/**
 * #92 — persistence for the Histórico's saved views. Every function is scoped
 * by `userId` in the WHERE clause, never by the row's own id alone: a view is
 * private to its owner, so passing somebody else's id must find nothing rather
 * than reach a permission check that could be forgotten.
 */

export type SavedView = {
  id: string;
  name: string;
  filters: HistoryFilters;
};

function toFilters(row: Record<string, unknown>): HistoryFilters {
  const out: HistoryFilters = {};
  for (const k of HISTORY_FILTER_KEYS) {
    const v = row[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}

/** This user's views, oldest first so the chip row does not reshuffle on every save. */
export async function listViews(userId: string): Promise<SavedView[]> {
  const rows = await prisma.savedHistoryView.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY_VIEWS,
  });
  return rows.map((r) => ({ id: r.id, name: r.name, filters: toFilters(r) }));
}

export type SaveResult =
  | { ok: true; view: SavedView }
  | { ok: false; reason: "invalid_name" | "duplicate_name" | "limit_reached" };

/** Create a view from the filters currently applied. */
export async function createView(
  userId: string,
  rawName: unknown,
  filters: HistoryFilters,
): Promise<SaveResult> {
  const name = historyViewName(rawName);
  if (!name) return { ok: false, reason: "invalid_name" };

  const count = await prisma.savedHistoryView.count({ where: { userId } });
  if (count >= MAX_HISTORY_VIEWS) return { ok: false, reason: "limit_reached" };

  try {
    const row = await prisma.savedHistoryView.create({
      data: {
        userId,
        name,
        q: filters.q ?? null,
        from: filters.from ?? null,
        to: filters.to ?? null,
        carrier: filters.carrier ?? null,
        plate: filters.plate ?? null,
      },
    });
    return { ok: true, view: { id: row.id, name: row.name, filters: toFilters(row) } };
  } catch {
    // The only constraint that can fire here is @@unique([userId, name]).
    return { ok: false, reason: "duplicate_name" };
  }
}

/** Rename a view. Scoped by userId, so another user's id simply does not match. */
export async function renameView(
  userId: string,
  id: string,
  rawName: unknown,
): Promise<SaveResult | { ok: false; reason: "not_found" }> {
  const name = historyViewName(rawName);
  if (!name) return { ok: false, reason: "invalid_name" };

  const existing = await prisma.savedHistoryView.findFirst({ where: { id, userId } });
  if (!existing) return { ok: false, reason: "not_found" };

  try {
    const row = await prisma.savedHistoryView.update({ where: { id }, data: { name } });
    return { ok: true, view: { id: row.id, name: row.name, filters: toFilters(row) } };
  } catch {
    return { ok: false, reason: "duplicate_name" };
  }
}

/** Delete a view. Returns false when it is not this user's (or does not exist). */
export async function deleteView(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.savedHistoryView.deleteMany({ where: { id, userId } });
  return count > 0;
}
