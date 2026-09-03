"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/attribution/client";

/**
 * Records an acquisition touch (ref + UTMs) on every navigation. Renders nothing,
 * adds no visible friction. Mounted once in the root layout.
 */
export function AttributionCapture() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    captureAttribution();
    // re-run when the URL changes (SPA navigation)
  }, [pathname, search]);
  return null;
}
