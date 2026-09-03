/**
 * R-9: the public URL must be available throughout the service and MAY be
 * deactivated 7 natural days after the service ends. We keep it available until
 * then; the document + PDF are never deleted (R-10).
 */
const GRACE_DAYS = 7;

export function isPubliclyAvailable(
  serviceEnd: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!serviceEnd) return true; // service not marked ended → always available
  const cutoff = new Date(serviceEnd.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
  return now.getTime() <= cutoff.getTime();
}
