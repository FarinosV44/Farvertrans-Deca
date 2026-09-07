export const DEFAULT_PROD_DENY: string[];
export function looksLikeProduction(url: string | undefined, deny?: string[]): boolean;
export function restoreAllowed(
  url: string | undefined,
  opts?: { forceFlag?: boolean; understand?: string },
  deny?: string[],
): { allowed: boolean; reason?: string; warning?: string };
