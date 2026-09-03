import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SetNewPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResetTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[480px] px-4 py-12 md:px-6">
        <SetNewPasswordForm token={token} />
      </main>
      <SiteFooter />
    </>
  );
}
