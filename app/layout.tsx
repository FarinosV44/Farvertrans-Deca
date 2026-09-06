import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { publicEnv } from "@/lib/env";
import { titleTemplate, BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: LEGAL_ENTITY.name,
  url: publicEnv.baseUrl,
  email: LEGAL_ENTITY.supportEmail,
  brand: { "@type": "Brand", name: BRAND.name },
  address: { "@type": "PostalAddress", streetAddress: LEGAL_ENTITY.address },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <html lang={locale} className={inter.variable}>
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
