import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[560px] px-4 py-12 md:px-6">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
