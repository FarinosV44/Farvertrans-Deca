import { DecaValidationError } from "./validate";
import { StorageError } from "@/lib/storage/errors";

/**
 * Stage-aware DeCA generation failures (P0 FIX #29).
 *
 * Before this, every render/storage/database failure collapsed into one generic
 * 500 and the user saw "No se pudo generar el DeCA" with nothing to report. Now
 * every failure carries the STAGE it happened in and a short CORRELATION code the
 * user can read out loud, so support can find the exact server-side record
 * without SSH access.
 *
 * Pure logic — no I/O, no `server-only`, safe to unit-test.
 */

export const GENERATION_STAGES = [
  "validation",
  "configuration",
  "pdf_render",
  "pdf_storage",
  "database",
  "unknown",
] as const;

export type GenerationStage = (typeof GENERATION_STAGES)[number];

/** Unambiguous alphabet: no O/0, no I/1 — the code is read out over the phone. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/**
 * Mint a short, user-readable correlation code. Not a secret and not a key: it
 * only has to be unique enough to find one failure among a day's failures.
 */
export function newCorrelationId(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** A generation failure that already knows which stage it happened in. */
export class GenerationError extends Error {
  readonly stage: GenerationStage;
  readonly correlationId: string;

  constructor(stage: GenerationStage, cause: unknown, correlationId = newCorrelationId()) {
    super(`deca generation failed at stage "${stage}"`, { cause });
    this.name = "GenerationError";
    this.stage = stage;
    this.correlationId = correlationId;
  }
}

function nameOf(e: unknown): string {
  if (e instanceof Error) return e.name || e.constructor.name;
  return "";
}

function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message ?? "";
  if (typeof e === "string") return e;
  return "";
}

/**
 * Classify an arbitrary throwable into a generation stage. Used for anything
 * that was not already wrapped in a {@link GenerationError} — a third-party
 * library throwing its own error type, for instance.
 */
export function classifyError(e: unknown): GenerationStage {
  if (e instanceof GenerationError) return e.stage;
  if (e instanceof DecaValidationError) return "validation";
  if (e instanceof StorageError) return "pdf_storage";

  const name = nameOf(e);
  const msg = messageOf(e);
  const code =
    typeof e === "object" && e !== null ? String((e as { code?: unknown }).code ?? "") : "";

  if (name === "DecaValidationError" || name === "ZodError") return "validation";
  if (name === "StorageError") return "pdf_storage";
  if (/invalid environment configuration|missing required env|is not set/i.test(msg))
    return "configuration";
  if (name.startsWith("PrismaClient") || /^P[12]\d{3}$/.test(code)) return "database";
  if (/database|relation .* does not exist|connection refused|ECONNREFUSED/i.test(msg))
    return "database";
  if (/font|fontkit|pdf|render|glyph/i.test(msg)) return "pdf_render";
  if (/bucket|storage|ENOSPC|EACCES|EROFS/i.test(msg)) return "pdf_storage";
  return "unknown";
}

const MAX_SUMMARY = 200;

/**
 * Reduce a throwable to something safe to log: the error class plus a truncated,
 * redacted message. Emails and identifier-looking runs are stripped — a DeCA
 * carries third-party personal data and must never reach the logs (RGPD, T-14).
 */
export function safeErrorSummary(e: unknown): { errorClass: string; message: string } {
  const errorClass =
    e instanceof Error ? e.name || e.constructor.name : e === null ? "unknown" : typeof e;
  let message = messageOf(e)
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted]")
    .replace(/\b[A-Za-z]?\d{7,}[A-Za-z]?\b/g, "[redacted]");
  if (message.length > MAX_SUMMARY) message = `${message.slice(0, MAX_SUMMARY - 1)}…`;
  return { errorClass: errorClass || "unknown", message };
}

/**
 * The calm, actionable Spanish message shown for a failed stage. Never the raw
 * error: the user gets what to do next, and the correlation code carries the
 * diagnosis.
 */
export function stageMessage(stage: GenerationStage): string {
  switch (stage) {
    case "validation":
      return "Faltan datos obligatorios o alguno no es válido. Revisa el formulario.";
    case "configuration":
      return "El servicio no está disponible ahora mismo. Tus datos siguen guardados; inténtalo en unos minutos.";
    case "pdf_render":
      return "No hemos podido componer el documento. Tus datos siguen guardados. Reintenta en unos segundos.";
    case "pdf_storage":
      return "No hemos podido guardar el documento. Tus datos siguen guardados. Reintenta en unos segundos.";
    case "database":
      return "No hemos podido registrar el documento. Tus datos siguen guardados. Reintenta en unos segundos.";
    default:
      return "No hemos podido generar el documento. Tus datos siguen guardados. Reintenta en unos segundos.";
  }
}
