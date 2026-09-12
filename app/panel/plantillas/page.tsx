import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { TemplateList } from "@/components/deca/template-list";
import { getCurrentUser } from "@/lib/auth";
import { listTemplates } from "@/lib/data/templates";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plantillas", robots: { index: false } };

export default async function PlantillasPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro/completar-empresa");

  const [templates, t] = await Promise.all([listTemplates(user.companyId), getDictionary()]);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{t.panel.nav.plantillas}</h1>
        <AppNav current="plantillas" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t.panel.templates.intro}</p>
        <TemplateList templates={templates} t={t.panel.templates} />
      </main>
      <SiteFooter />
    </>
  );
}
