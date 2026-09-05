import Link from "next/link";
import { CtaButton } from "./cta-button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getLocale, getDictionary } from "@/lib/i18n/server";

/**
 * Site header (BRAND #21 / DESIGN #22 / ACCOUNT #23).
 * - brand wordmark → `/`
 * - section nav on the landing (desktop only, `nav`)
 * - `authed` undefined/false → `Entrar`; `authed` true → `Ir a mi panel`
 *   (the caller passes it so static pages stay static)
 * - persistent primary CTA
 * - language switcher (I18N #1) — present on every page that renders this
 *   shared header, which is how the switcher reaches landing/registration/
 *   login/panel/creator/settings without threading a prop through each.
 */
export async function SiteHeader({
  nav = false,
  authed = false,
  companyName,
}: {
  nav?: boolean;
  authed?: boolean;
  companyName?: string;
}) {
  const locale = await getLocale();
  const es = await getDictionary(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="brand no-underline text-[var(--color-text)]"
          aria-label={`${es.common.appName} — inicio`}
        >
          <Wordmark size={26} />
        </Link>

        {nav && (
          <nav className="ml-4 hidden items-center gap-5 text-sm md:flex" aria-label="Secciones">
            <Link href="/#pasos" className="no-underline hover:text-[var(--color-primary)]">
              {es.nav.howItWorks}
            </Link>
            <Link href="/soy-obligado" className="no-underline hover:text-[var(--color-primary)]">
              {es.nav.regulation}
            </Link>
            <Link href="/guias" className="no-underline hover:text-[var(--color-primary)]">
              {es.nav.guides}
            </Link>
            <Link href="/blog" className="no-underline hover:text-[var(--color-primary)]">
              {es.nav.blog}
            </Link>
            <Link href="/#faq" className="no-underline hover:text-[var(--color-primary)]">
              {es.nav.faq}
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher current={locale} />
          {authed ? (
            companyName ? (
              <AccountMenu companyName={companyName} />
            ) : (
              <Link
                href="/panel"
                data-testid="header-panel"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 text-sm font-medium no-underline hover:border-[var(--color-primary)]"
              >
                {es.common.panelCta}
              </Link>
            )
          ) : (
            <TrackedLink
              href="/entrar"
              event="login_click"
              data-testid="header-login"
              className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium no-underline hover:text-[var(--color-primary)]"
            >
              {es.common.loginCta}
            </TrackedLink>
          )}
          <CtaButton event="header_cta" className="!min-h-10 !px-4 text-sm">
            {es.common.headerCta}
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
