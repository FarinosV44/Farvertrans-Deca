import { getInternalUser } from "@/lib/admin/guard";
import { countUnusedRecoveryCodes } from "@/lib/auth/recovery-codes";
import { listTrustedDevices } from "@/lib/auth/trusted-device";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { SecurityScreen } from "@/components/admin/security-screen";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Seguridad",
  robots: { index: false, follow: false },
};

/**
 * Settings → Security (SECURITY #53 passkey follow-up, brief item 5):
 * passkeys, TOTP fallback, recovery codes and trusted devices, all in one
 * place. Guarded by the `(protected)` layout's `requireInternal()` already.
 */
export default async function AdminSeguridad() {
  const user = await getInternalUser();
  if (!user) return null;

  const [credentials, trustedDevices, recoveryCodesRemaining] = await Promise.all([
    prisma.webAuthnCredential.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        deviceType: true,
        backedUp: true,
        createdAt: true,
        lastUsedAt: true,
      },
    }),
    listTrustedDevices(user.id),
    countUnusedRecoveryCodes(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seguridad"
        lead="Claves de acceso, verificación en dos pasos, códigos de recuperación y dispositivos de confianza de tu cuenta de administrador."
      />
      <SecurityScreen
        totpEnabled={!!user.totpEnabledAt}
        credentials={credentials.map((c) => ({
          id: c.id,
          name: c.name,
          deviceType: c.deviceType,
          backedUp: c.backedUp,
          createdAt: c.createdAt.toISOString(),
          lastUsedAt: c.lastUsedAt?.toISOString() ?? null,
        }))}
        trustedDevices={trustedDevices.map((d) => ({
          id: d.id,
          label: d.label,
          createdAt: d.createdAt.toISOString(),
          expiresAt: d.expiresAt.toISOString(),
          lastSeenAt: d.lastSeenAt?.toISOString() ?? null,
        }))}
        recoveryCodesRemaining={recoveryCodesRemaining}
      />
    </div>
  );
}
