import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { TemplateList } from "@/components/deca/template-list";
import { getCurrentUser } from "@/lib/auth";
import { listTemplates } from "@/lib/data/templates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plantillas", robots: { index: false } };

export default async function PlantillasPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const templates = await listTemplates(user.companyId);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Plantillas</h1>
        <AppNav current="plantillas" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Guarda las rutas que repites. Al crear un DeCA desde una plantilla se rellena todo menos
          la fecha; siempre revisas los datos y generas un documento nuevo e independiente.
        </p>
        <TemplateList templates={templates} />
      </main>
      <SiteFooter />
    </>
  );
}
