import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Append-only security audit trail (SECURITY #53). No route or UI anywhere
 * in the product edits or deletes a `SecurityAuditLog` row — this function
 * is the only writer, and it never throws (an audit failure must never
 * block the action being audited).
 */
export async function recordAudit(entry: {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  result: "success" | "failure";
  headers?: Headers;
}): Promise<void> {
  try {
    await prisma.securityAuditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        result: entry.result,
        ip: entry.headers ? ipFrom(entry.headers) : undefined,
        userAgent: entry.headers?.get("user-agent")?.slice(0, 300) ?? undefined,
      },
    });
  } catch {
    // an audit-log write must never block or fail the audited action itself
  }
}

function ipFrom(headers: Headers): string | undefined {
  const fwd = headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || undefined;
}
