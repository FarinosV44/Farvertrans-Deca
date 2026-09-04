import "server-only";
import { prisma } from "@/lib/prisma";
import { APP_VERSION } from "@/lib/version";
import {
  classifyError,
  newCorrelationId,
  safeErrorSummary,
  stageMessage,
  type GenerationStage,
} from "./generation";

/**
 * Persist and report classified generation failures (P0 FIX #29).
 *
 * A failure is written to `generation_failure` keyed by the short correlation
 * code the user sees, and logged as one structured line. NOTHING from the DeCA
 * payload is recorded — see `safeErrorSummary()`.
 */

export type RecordedFailure = {
  correlationId: string;
  stage: GenerationStage;
  message: string;
};

export type FailureContext = {
  route: string;
  authenticated: boolean;
  companyId?: string;
};

/** The storage driver actually in force, for diagnosis (never a key or a URL). */
export function storageDriver(): string {
  return process.env.FVD_STORAGE === "supabase" ? "supabase" : "local";
}

/**
 * Classify, log and store a generation failure.
 *
 * Never throws: a failure to record a failure must not replace the original
 * error. Returns the correlation code and the calm message for the client.
 */
export async function recordGenerationFailure(
  e: unknown,
  ctx: FailureContext,
): Promise<RecordedFailure> {
  const stage = classifyError(e);
  const correlationId =
    e instanceof Error && "correlationId" in e && typeof e.correlationId === "string"
      ? e.correlationId
      : newCorrelationId();
  const cause = e instanceof Error && e.cause !== undefined ? e.cause : e;
  const { errorClass, message } = safeErrorSummary(cause);

  // One structured line — greppable in any host's log viewer.
  console.error(
    JSON.stringify({
      evt: "deca_generation_failed",
      correlationId,
      stage,
      route: ctx.route,
      errorClass,
      message,
      authenticated: ctx.authenticated,
      appVersion: APP_VERSION,
      storage: storageDriver(),
      node: process.version,
    }),
  );

  try {
    await prisma.generationFailure.create({
      data: {
        correlationId,
        stage,
        errorClass,
        message,
        route: ctx.route,
        authenticated: ctx.authenticated,
        companyId: ctx.companyId,
        appVersion: APP_VERSION,
        storageDriver: storageDriver(),
      },
    });
  } catch {
    // The database itself may be the failing stage — the log line above is the
    // record of last resort. Never mask the original error with this one.
  }

  return { correlationId, stage, message: stageMessage(stage) };
}

/** Mark the failure behind a correlation code as recovered by a later retry. */
export async function markFailureRetried(correlationId: string): Promise<void> {
  try {
    await prisma.generationFailure.update({
      where: { correlationId },
      data: { retriedOk: true, resolvedAt: new Date() },
    });
  } catch {
    /* best-effort */
  }
}
