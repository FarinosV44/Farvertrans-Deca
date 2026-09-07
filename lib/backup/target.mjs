/**
 * The safety guard for `scripts/restore.mjs` (#60): a restore must land in a
 * scratch database, never over production, unless the operator very explicitly
 * overrides. Pure, so it can be unit-tested.
 */

/** Hosts/fragments a restore target must not contain without an override. */
export const DEFAULT_PROD_DENY = ["pooler.supabase.com", "supabase.co", "decaprofesional"];

export function looksLikeProduction(url, deny = DEFAULT_PROD_DENY) {
  if (!url) return false;
  return deny.some((d) => d && url.includes(d));
}

/**
 * Whether a restore into `url` is allowed. `override` is only honoured when
 * BOTH the `--force-production` flag and the `I_UNDERSTAND` env value are set.
 */
export function restoreAllowed(url, { forceFlag = false, understand = "" } = {}, deny) {
  if (!looksLikeProduction(url, deny)) return { allowed: true };
  const overridden = forceFlag && understand === "overwrite-production";
  return overridden
    ? { allowed: true, warning: "restoring over a production-looking target on explicit override" }
    : { allowed: false, reason: "target looks like production; restore into a scratch database" };
}
