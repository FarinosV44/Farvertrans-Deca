import "server-only";
import { prisma } from "@/lib/prisma";

export class ClaimError extends Error {
  constructor(
    public code: "not_found" | "expired" | "used" | "already_owned",
    message: string,
  ) {
    super(message);
    this.name = "ClaimError";
  }
}

/**
 * Attach an anonymous DeCA to a company via its one-time 30-day claim token
 * (D-016 / F6). The public inspection token/URL is never regenerated. Idempotent
 * for the same company (returns ok if it already owns it).
 */
export async function claimDeca(
  token: string,
  companyId: string,
  userId: string,
): Promise<{ decaId: string }> {
  const claim = await prisma.claimToken.findUnique({ where: { token }, include: { deca: true } });
  if (!claim) throw new ClaimError("not_found", "Este enlace de guardado no es válido.");
  if (claim.deca.companyId === companyId) return { decaId: claim.decaId };
  if (claim.usedAt) throw new ClaimError("used", "Este enlace de guardado ya se ha utilizado.");
  if (claim.expiresAt.getTime() < Date.now())
    throw new ClaimError(
      "expired",
      "El enlace de guardado ha caducado. El DeCA sigue siendo válido y accesible por su URL.",
    );

  await prisma.$transaction(async (tx) => {
    await tx.deca.update({
      where: { id: claim.decaId },
      data: { companyId, createdByUserId: userId },
    });
    await tx.claimToken.update({ where: { token }, data: { usedAt: new Date() } });
  });

  try {
    const { markFirstDeca } = await import("@/lib/attribution/persist");
    await markFirstDeca(companyId);
  } catch {
    /* non-critical */
  }
  return { decaId: claim.decaId };
}
