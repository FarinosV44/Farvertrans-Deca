import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { publicEnv } from "@/lib/env";
import { titleTemplate } from "@/lib/brand";
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
    default: "DeCA Gratis | Genera el Documento de Control Online",
    template: titleTemplate,
  },
  description:
    "Genera gratis el Documento Electrónico de Control (DeCA) obligatorio desde el 5 de octubre de 2026. PDF nativo, QR y conservación online. Sin tarjeta y sin límite.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <html lang={locale} className={inter.variable}>
      <body>
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
