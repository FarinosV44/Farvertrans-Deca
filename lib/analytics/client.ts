"use client";
import { APP_VERSION } from "@/lib/version";
import { pickRefSnapshot, type EventName } from "./events";

const SESSION_KEY = "fvd_sid";

/** Stable per-browser session id (first-party, opaque, no PII). */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = window.localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID().replace(/-/g, "");
      window.localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "nostore";
  }
}

/**
 * Fire an analytics event. Best-effort: uses sendBeacon so it survives navigation,
 * never blocks the UI, never throws.
 */
export function track(name: EventName): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      name,
      sessionId: getSessionId(),
      path: window.location.pathname,
      ref: pickRefSnapshot(params),
      appVersion: APP_VERSION,
    });
    // keepalive fetch survives navigation like sendBeacon, and keeps a real
    // JSON body/content-type (which sendBeacon Blobs hide from tooling).
    void fetch("/api/events", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "content-type": "application/json" },
    }).catch(() => {});
  } catch {
    // analytics never affects the user
  }
}
