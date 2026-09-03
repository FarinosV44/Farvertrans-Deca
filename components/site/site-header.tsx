import Link from "next/link";
import { CtaButton } from "./cta-button";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="brand flex items-center gap-2 font-bold text-[var(--color-text)] no-underline"
          aria-label="Farvertrans DeCA — inicio"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--color-primary)] text-white"
          >
            ✓
          </span>
          Farvertrans DeCA
        </Link>
        <CtaButton className="!min-h-10 !px-4 text-sm">Crear DeCA</CtaButton>
      </div>
    </header>
  );
}
