import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RequestResetForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = {
  title: "Recuperar acceso",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[480px] px-4 py-12 md:px-6">
        <RequestResetForm />
      </main>
      <SiteFooter />
    </>
  );
}
