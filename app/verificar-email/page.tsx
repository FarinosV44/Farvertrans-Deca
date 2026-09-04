import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { VerifyEmailScreen } from "@/components/auth/verify-email-screen";
import { getCurrentUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Confirma tu correo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/registro");

  const { next } = await searchParams;
  const nextPath = safeInternalPath(next);
  if (user.emailVerifiedAt) redirect(nextPath);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[480px] px-4 py-12 md:px-6">
        <VerifyEmailScreen email={user.email} next={nextPath} />
      </main>
      <SiteFooter />
    </>
  );
}
