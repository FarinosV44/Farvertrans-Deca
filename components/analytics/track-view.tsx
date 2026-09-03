"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import type { EventName } from "@/lib/analytics/events";

/** Fires a single analytics event once on mount. Renders nothing. */
export function TrackView({ event }: { event: EventName }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
