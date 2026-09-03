"use client";
import { useEffect } from "react";
import { es } from "@/lib/i18n/es";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-visible errors are also surfaced in the server log via Next's reporting.
    console.error(error);
  }, [error]);

  return (
    <main id="contenido" className="mx-auto max-w-[1120px] px-4 py-24 md:px-6">
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">{es.errors.generic}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-12 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 font-medium text-[var(--color-primary)]"
      >
        Reintentar
      </button>
    </main>
  );
}
