import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { publicEnv } from "@/lib/env";
import { titleTemplate, BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import "./globals.css";

// Sistema Vía (#67): Archivo carries the structural voice, IBM Plex Mono the
// technical layer (references, NIF, tokens, timestamps). #96 (Core Web
// Vitals): Inter (previously declared as a third "body/fallback face") was
// removed — `--font-sans` never actually resolved to it (Archivo, loaded
// first, always succeeds), so it was a whole extra font family downloaded
// on every page for zero visual effect.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.baseUrl),
  title: {
    default: "DeCA Profesional | Generador online del Documento de Control",
    template: titleTemplate,
  },
  description:
    "Genera y gestiona el Documento Electrónico de Control (DeCA) del transporte de mercancías por carretera: PDF nativo, QR, historial y conservación online.",
  robots: { index: true, follow: true },
};

/**
 * Site-wide Organization JSON-LD (SEO task #6/#3). Built ONLY from the
 * already-vetted `LEGAL_ENTITY`/`BRAND` copy — no new claims invented.
 *
 * PRAETORIA, S.L. is the legal operator, with its own corporate site
 * (`LEGAL_ENTITY.corporateUrl`); DeCA Profesional is its product brand, with
 * the product's own domain (`publicEnv.baseUrl`) under `brand.url`. Never
 * the reverse — corrected in the 2026-09 legal-content pass after the first
 * version of this block set `url` to the DeCA Profesional domain instead of
 * PRAETORIA's own (docs/decisions.md D-108).
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: LEGAL_ENTITY.name,
  url: LEGAL_ENTITY.corporateUrl,
  email: LEGAL_ENTITY.supportEmail,
  // #98: the CIF is already public elsewhere on the site (legal pages,
  // footer, LEGAL #52) — this only surfaces the same real value, never a
  // new one. `logo` uses the icon.svg the browser tab already shows: no
  // separate hosted wordmark image exists to reference instead, and
  // inventing one to satisfy the schema is exactly what the issue's own
  // "no marcar contenido que no existe" principle forbids.
  taxID: LEGAL_ENTITY.cif,
  logo: `${publicEnv.baseUrl}/icon.svg`,
  address: { "@type": "PostalAddress", streetAddress: LEGAL_ENTITY.address },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: LEGAL_ENTITY.supportPhone,
    email: LEGAL_ENTITY.supportEmail,
  },
  brand: { "@type": "Brand", name: BRAND.name, url: publicEnv.baseUrl },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <html lang={locale} className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Same safe-JSON-LD-escaping pattern as the rest of the site (T-5).
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <LocaleProvider locale={locale}>
          <a href="#contenido" className="skip-link">
            {dict.common.skipToContent}
          </a>
          <Suspense fallback={null}>
            <AttributionCapture />
          </Suspense>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
