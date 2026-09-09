import Link from "next/link";
import { CtaButton } from "./cta-button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { CommandPalette } from "@/components/panel/command-palette";
import { getLocale } from "@/lib/i18n/server";
import { HEADER_STRINGS, HEADER_APP_NAME } from "@/lib/i18n/header-strings";
import type { Locale } from "@/lib/i18n/locale";

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
 *
 * #96 (Core Web Vitals): `locale` is optional. A STATIC page (the SEO
 * cluster, legal pages) passes it explicitly — a fixed prop, not a
 * `cookies()` read, so the page keeps its static generation / CDN caching.
 * Omitted, this falls back to the old behaviour (`getLocale()`, the visitor's
 * `fvd_locale` cookie) for pages that are already dynamic (auth, forms) and
 * lose nothing by it. Either way `LanguageSwitcher` corrects the header text
 * client-side after mount if the visitor's actual cookie preference differs
 * from what was server-rendered — see its own comment.
 */
export async function SiteHeader({
  nav = false,
  authed = false,
  companyName,
  locale,
}: {
  nav?: boolean;
  authed?: boolean;
  companyName?: string;
  locale?: Locale;
}) {
  const resolvedLocale = locale ?? (await getLocale());
  const es = HEADER_STRINGS[resolvedLocale];
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--color-text)] bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
        <Link
          href="/"
          className="brand shrink-0 no-underline text-[var(--color-text)]"
          aria-label={`${HEADER_APP_NAME} — inicio`}
        >
          <Wordmark size={26} hideTextOnMobile />
        </Link>

        {nav && (
          <nav
            className="ml-4 hidden items-center gap-4 text-sm lg:flex xl:gap-5"
            aria-label="Secciones"
          >
            <Link
              href="/#pasos"
              data-i18n-key="howItWorks"
              className="no-underline hover:text-[var(--color-primary)]"
            >
              {es.howItWorks}
            </Link>
            <Link
              href="/soy-obligado"
              data-i18n-key="regulation"
              className="no-underline hover:text-[var(--color-primary)]"
            >
              {es.regulation}
            </Link>
            <Link
              href="/guias"
              data-i18n-key="guides"
              className="no-underline hover:text-[var(--color-primary)]"
            >
              {es.guides}
            </Link>
            <Link
              href="/blog"
              data-i18n-key="blog"
              className="no-underline hover:text-[var(--color-primary)]"
            >
              {es.blog}
            </Link>
            <Link
              href="/#faq"
              data-i18n-key="faq"
              className="no-underline hover:text-[var(--color-primary)]"
            >
              {es.faq}
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          {authed && companyName && <CommandPalette />}
          <LanguageSwitcher current={resolvedLocale} />
          {authed ? (
            companyName ? (
              <AccountMenu companyName={companyName} />
            ) : (
              <Link
                href="/panel"
                data-testid="header-panel"
                data-i18n-key="panelCta"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 text-sm font-medium no-underline hover:border-[var(--color-primary)]"
              >
                {es.panelCta}
              </Link>
            )
          ) : (
            <TrackedLink
              href="/entrar"
              event="login_click"
              data-testid="header-login"
              className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] px-2 text-sm font-medium no-underline hover:text-[var(--color-primary)]"
            >
              <span data-i18n-key="loginCta">{es.loginCta}</span>
            </TrackedLink>
          )}
          <CtaButton event="header_cta" className="!min-h-10 !px-3 text-sm">
            <span data-i18n-key="headerCta">{es.headerCta}</span>
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
