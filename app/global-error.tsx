"use client";

import { useEffect } from "react";
import { IncidentPage } from "@/components/errors/incident-page";
import "./globals.css";

/**
 * Root-layout error boundary (#118) — the ONLY mechanism that catches an error
 * thrown by `app/layout.tsx` itself. Must render its own <html>/<body> and must
 * NOT depend on anything the root layout provides (LocaleProvider, getLocale(),
 * getDictionary(), fonts, JSON-LD): if the layout is what broke, none of that
 * can be trusted to still work. `IncidentPage` already satisfies this (static
 * `es` copy, no data fetching) — reused as-is.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error.tsx]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="es">
      <body>
        <IncidentPage onRetry={reset} />
      </body>
    </html>
  );
}
