import Link from "next/link";
import { es } from "@/lib/i18n/es";
import { APP_VERSION } from "@/lib/version";

// Minimal landing shell (BUILD 05). The full production landing is BUILD 06.
export default function HomePage() {
  return (
    <>
      <header className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4 md:px-6">
        <span className="font-bold text-lg">Farvertrans DeCA</span>
      </header>
      <main id="contenido" className="mx-auto max-w-[1120px] px-4 py-16 md:px-6">
        <h1 className="text-4xl md:text-6xl font-bold">{es.landing.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
          {es.landing.subhead}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{es.landing.trust}</p>
        <div className="mt-8">
          <Link
            href="/crear"
            className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)]"
          >
            {es.common.createCta}
          </Link>
        </div>
      </main>
      <footer className="mx-auto max-w-[1120px] px-4 py-8 text-sm text-[var(--color-text-muted)] md:px-6">
        Farvertrans DeCA v{APP_VERSION}
      </footer>
    </>
  );
}
