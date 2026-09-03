"use client";
import { EMPTY_ATTRIBUTION, lock, mergeFromUrl, type Attribution } from "./merge";
import { ATTR_COOKIE } from "./parse";

export { ATTR_COOKIE };
const MAX_AGE_S = 60 * 60 * 24 * 365; // 1 year

function readCookie(): Attribution {
  if (typeof document === "undefined") return EMPTY_ATTRIBUTION;
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${ATTR_COOKIE}=`))
      ?.slice(ATTR_COOKIE.length + 1);
    if (raw) return JSON.parse(decodeURIComponent(raw)) as Attribution;
    const ls = window.localStorage.getItem(ATTR_COOKIE);
    if (ls) return JSON.parse(ls) as Attribution;
  } catch {
    /* ignore */
  }
  return EMPTY_ATTRIBUTION;
}

function writeCookie(a: Attribution): void {
  try {
    const value = encodeURIComponent(JSON.stringify(a));
    document.cookie = `${ATTR_COOKIE}=${value}; Max-Age=${MAX_AGE_S}; Path=/; SameSite=Lax`;
    window.localStorage.setItem(ATTR_COOKIE, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

/** Capture the current URL as an acquisition touch. Invisible, best-effort. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const merged = mergeFromUrl(
      readCookie(),
      new URL(window.location.href),
      document.referrer || null,
    );
    writeCookie(merged);
  } catch {
    /* ignore */
  }
}

/** Lock attribution after signup — first-touch is now permanent. */
export function lockAttribution(): void {
  if (typeof window === "undefined") return;
  writeCookie(lock(readCookie()));
}
