"use client";

import { useEffect } from "react";
import { IncidentPage } from "@/components/errors/incident-page";

/**
 * Route-segment error boundary (#118): catches an uncontrolled render/server
 * error anywhere below the root layout and shows the branded incident screen
 * instead of a framework/technical page. Kept separate from `app/not-found.tsx`
 * (404 is "page doesn't exist", this is "something broke").
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Full detail (message, stack, Next's own digest) stays server/console-side —
    // the user only ever sees the generic branded message.
    console.error("[error.tsx]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return <IncidentPage onRetry={reset} />;
}
