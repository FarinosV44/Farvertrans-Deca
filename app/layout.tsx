import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { es } from "@/lib/i18n/es";
import { publicEnv } from "@/lib/env";
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
    template: "%s | Farvertrans DeCA",
  },
  description:
    "Genera gratis el Documento Electrónico de Control (DeCA) obligatorio desde el 5 de octubre de 2026. PDF nativo, QR y conservación online. Sin tarjeta y sin límite.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <a href="#contenido" className="skip-link">
          {es.common.skipToContent}
        </a>
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
