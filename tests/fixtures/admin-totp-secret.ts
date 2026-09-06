/**
 * Fixed TOTP secret for the seeded local/test admin account ONLY
 * (`admin@farvertrans.local`, `prisma/seed.ts`). Never used for a real
 * account — e2e specs import this to compute a live code and actually
 * exercise the mandatory admin-2FA challenge (SECURITY #53) instead of
 * bypassing it.
 */
export const ADMIN_TEST_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
