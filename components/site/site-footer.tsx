import Link from "next/link";
import { APP_VERSION } from "@/lib/version";
import { LEGAL_SOURCE } from "@/lib/content/landing";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";

type FooterLink = { label: string; href: string };

const PRODUCT: FooterLink[] = [
  { label: "Crear DeCA", href: "/crear" },
  { label: "Cómo funciona", href: "/#pasos" },
  { label: "Planes 2027", href: "/#planes" },
  { label: "Empresas de transporte", href: "/deca-empresas-transporte" },
  { label: "Agencias / operadores", href: "/deca-agencias-transporte" },
];

const RESOURCES: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Guías", href: "/guias" },
  { label: "Normativa", href: "/soy-obligado" },
  { label: "Preguntas frecuentes", href: "/#faq" },
];

const LEGAL: FooterLink[] = [
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Términos", href: "/terminos" },
  { label: "Cookies", href: "/cookies" },
  { label: "Contacto", href: "/contacto" },
  { label: "Autoría y revisión legal", href: "/revision-legal" },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text)]">
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label + l.href}>
            <Link
              href={l.href}
              className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary)] hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <p className="text-lg font-bold text-[var(--color-text)]">{BRAND.name}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Plataforma para generar, custodiar y verificar el Documento Electrónico de Control en
              el transporte por carretera.
            </p>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              PDF nativo + QR · Custodia digital · Histórico
            </p>
          </div>
          <FooterColumn title="Producto" links={PRODUCT} />
          <FooterColumn title="Recursos" links={RESOURCES} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-muted)]">
            Conforme a la{" "}
            <a
              href={LEGAL_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-primary)]"
            >
              {LEGAL_SOURCE.label}
            </a>
            .
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[var(--color-text-muted)]">
            <p>
              © 2026 {BRAND.name} · v{APP_VERSION}
            </p>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="underline hover:text-[var(--color-primary)]"
            >
              {BRAND.supportEmail}
            </a>
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]" data-testid="footer-operator">
            {LEGAL_ENTITY.operatorLine}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{LEGAL_ENTITY.address}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Tel.{" "}
            <a
              href={`tel:${BRAND.supportPhone.replace(/\s+/g, "")}`}
              className="underline hover:text-[var(--color-primary)]"
            >
              {BRAND.supportPhone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
