import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EntrarPage() {
  const user = await getCurrentUser();
  if (user?.companyId) redirect("/panel");

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[520px] px-4 py-12 md:px-6">
        <Suspense fallback={null}>
          <RegisterForm initialMode="login" />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
