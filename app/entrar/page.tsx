import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
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

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <AuthShell>
      <Suspense fallback={null}>
        <RegisterForm initialMode="login" googleEnabled={googleEnabled} />
      </Suspense>
    </AuthShell>
  );
}
