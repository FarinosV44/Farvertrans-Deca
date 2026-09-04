import Link from "next/link";
import { APP_VERSION } from "@/lib/version";
import { LEGAL_SOURCE } from "@/lib/content/landing";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-[1120px] px-4 py-8 text-sm text-[var(--color-text-muted)] md:px-6">
        <p>
          {BRAND.name} — generador gratuito del Documento Electrónico de Control. Fuente normativa:{" "}
          <a href={LEGAL_SOURCE.url} target="_blank" rel="noopener noreferrer">
            {LEGAL_SOURCE.label}
          </a>
          .
        </p>
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/crear">Crear DeCA</Link>
          <span aria-hidden>·</span>
          <Link href="/guias">Guías</Link>
          <span aria-hidden>·</span>
          <Link href="/blog">Blog</Link>
          <span aria-hidden>·</span>
          <Link href="/soy-obligado">Normativa</Link>
          <span aria-hidden>·</span>
          <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
        </p>
        <p className="mt-2 text-xs">
          {BRAND.name} · v{APP_VERSION}
        </p>
      </div>
    </footer>
  );
}
