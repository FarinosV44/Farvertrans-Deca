import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { GENERATION_STAGES } from "@/lib/deca/generation";

/**
 * Read + triage the classified generation failures from #29 (ADMIN #33 §7).
 * A support user takes the 6-character correlation code from the customer and
 * lands on the exact failure here. Nothing in this module exposes the DeCA
 * payload — the `generation_failure` row never held it.
 */

export type FailureFilter = {
  stage?: string;
  status?: "unresolved" | "resolved" | "recovered";
  since?: Date;
};

export type FailureRow = {
  id: string;
  correlationId: string;
  stage: string;
  errorClass: string;
  message: string;
  route: string | null;
  authenticated: boolean;
  storageDriver: string | null;
  appVersion: string | null;
  retriedOk: boolean;
  resolvedAt: Date | null;
  note: string | null;
  createdAt: Date;
};

export async function listFailures(filter: FailureFilter = {}, take = 200): Promise<FailureRow[]> {
  const where: Record<string, unknown> = {};
  if (
    filter.stage &&
    GENERATION_STAGES.includes(filter.stage as (typeof GENERATION_STAGES)[number])
  )
    where.stage = filter.stage;
  if (filter.since) where.createdAt = { gte: filter.since };
  if (filter.status === "unresolved") Object.assign(where, { resolvedAt: null, retriedOk: false });
  if (filter.status === "resolved") where.resolvedAt = { not: null };
  if (filter.status === "recovered") where.retriedOk = true;

  return prisma.generationFailure.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** One failure by its user-facing correlation code (case-insensitive). */
export async function getFailure(correlationId: string): Promise<FailureRow | null> {
  return prisma.generationFailure.findUnique({
    where: { correlationId: correlationId.trim().toUpperCase() },
  });
}

/** Per-stage counts over a window, for the errors page summary. */
export async function failureStageCounts(since: Date): Promise<Record<string, number>> {
  const rows = await prisma.generationFailure.groupBy({
    by: ["stage"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });
  const out: Record<string, number> = {};
  for (const r of rows) out[r.stage] = r._count._all;
  return out;
}

export const failureTriageSchema = z.object({
  resolved: z.boolean().optional(),
  note: z.string().trim().max(1000).optional(),
});

export type FailureTriageInput = z.infer<typeof failureTriageSchema>;

/** Mark a failure resolved / add an internal note (#33 §7). Never edits the failure itself. */
export async function triageFailure(
  correlationId: string,
  input: FailureTriageInput,
): Promise<FailureRow | null> {
  const existing = await getFailure(correlationId);
  if (!existing) return null;
  return prisma.generationFailure.update({
    where: { id: existing.id },
    data: {
      ...(input.note !== undefined ? { note: input.note || null } : {}),
      ...(input.resolved === true ? { resolvedAt: existing.resolvedAt ?? new Date() } : {}),
      ...(input.resolved === false ? { resolvedAt: null } : {}),
    },
  });
}
