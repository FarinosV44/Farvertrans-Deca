import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { BRAND } from "@/lib/brand";
import { es } from "@/lib/i18n/dictionaries/es";

/**
 * Branded, dependency-free incident screen (#118) shared by `app/error.tsx`
 * (route-segment boundary) and `app/global-error.tsx` (root-layout boundary).
 * Must render correctly even if the DB/backend is down: no data fetching, no
 * i18n-context/locale-cookie lookup, no query beyond the static `es` dictionary
 * slice already used by the pre-existing error/not-found boundaries.
 */
export function IncidentPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="auth-ground flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="no-underline" aria-label={`${BRAND.name} — inicio`}>
        <Wordmark size={30} />
      </Link>
      <main
        id="contenido"
        className="mt-6 w-full max-w-[420px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center shadow-[0_1px_2px_rgba(15,23,32,0.04),0_12px_32px_-12px_rgba(15,23,32,0.12)] sm:p-8"
      >
        <h1 className="text-2xl font-bold">{es.errors.incidentTitle}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">{es.errors.incidentMessage}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 font-medium text-[var(--color-primary)]"
          >
            {es.errors.retry}
          </button>
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] px-5 font-medium underline"
          >
            {es.errors.goHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
