import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { DecaPreview } from "@/components/site/deca-preview";
import {
  CrearWizard,
  type SavedData,
  type WizardInitial,
  type WizardTemplate,
} from "@/components/deca/wizard";
import { getCurrentUser } from "@/lib/auth";
import { getDraft } from "@/lib/deca/draft";
import { getDecaForDuplicate } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { listTemplates } from "@/lib/data/templates";
import { LEAD_COOKIE } from "@/lib/deca/lead";
import { getDictionary } from "@/lib/i18n/server";
import { publicEnv } from "@/lib/env";
import { qrPngDataUriCached } from "@/lib/pdf/qr";

export const metadata: Metadata = {
  title: "Crear DeCA gratis",
  description:
    "Crea tu primer Documento Electrónico de Control sin registrarte, solo con tu nombre y email. 3 pasos, PDF nativo con QR y URL de descarga directa.",
  // SEO: /crear is the application/form screen, not a canonical landing
  // page — /generador-deca is the indexable transactional equivalent and
  // stays indexed. Kept out of the sitemap too (see app/sitemap.ts).
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function CrearPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const user = await getCurrentUser();

  // PRODUCT #56: a read_only (Auditor) member can view history/documents but
  // never reach the creator — enforced here (page-level) AND server-side on
  // every mutating route (never trust the UI gate alone, security.md).
  if (user?.companyRole === "read_only") {
    const t = await getDictionary();
    return (
      <>
        <SiteHeader authed companyName={user.company?.name} />
        <main id="contenido" className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-6">
          <h1 className="text-2xl font-bold">{t.crear.readOnlyGate.title}</h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t.crear.readOnlyGate.body}</p>
          <Link
            href="/panel/historico"
            data-testid="read-only-gate-history"
            className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            {t.crear.readOnlyGate.cta}
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  // D-060 (owner directive): a browser that already created one lead-gated
  // DeCA is sent to full registration for the next one — never a second
  // silent anonymous DeCA.
  if (!user?.companyId) {
    const store = await cookies();
    if (store.get(LEAD_COOKIE)) {
      const t = await getDictionary();
      return (
        <>
          <SiteHeader />
          <main id="contenido" className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-6">
            <h1 className="text-2xl font-bold">{t.crear.repeatGate.title}</h1>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t.crear.repeatGate.body}</p>
            <Link
              href="/registro?next=%2Fcrear"
              data-testid="lead-gate-register"
              className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-medium text-[var(--color-primary-contrast)] no-underline"
            >
              {t.crear.repeatGate.cta}
            </Link>
            <p className="mt-4 text-sm">
              <Link href="/entrar">{t.crear.repeatGate.loginPrompt}</Link>
            </p>
          </main>
          <SiteFooter />
        </>
      );
    }
  }

  let initial: WizardInitial | undefined;
  let saved: SavedData | undefined;
  let templates: WizardTemplate[] | undefined;

  if (user?.companyId) {
    const [s, t, source] = await Promise.all([
      listSaved(user.companyId),
      listTemplates(user.companyId),
      from ? getDecaForDuplicate(user.companyId, from) : Promise.resolve(null),
    ]);
    saved = s;
    templates = t;
    // #76: resume the user's saved draft (only when not duplicating).
    if (!source) {
      const draft = await getDraft(user.id);
      if (draft) initial = draft.dataJson as WizardInitial;
    }
    if (source) {
      initial = {
        shipperName: source.shipper?.name ?? "",
        shipperNif: source.shipper?.nif ?? "",
        shipperAddress: source.shipper?.address ?? "",
        carrierName: source.carrier?.name ?? "",
        carrierNif: source.carrier?.nif ?? "",
        carrierAddress: source.carrier?.address ?? "",
        loadLocationName: source.loadLocation?.name ?? "",
        loadLocationAddress: source.loadLocation?.address ?? "",
        loadLocationPostalCode: source.loadLocation?.postalCode ?? "",
        loadLocationCity: source.loadLocation?.city ?? "",
        loadLocationProvince: source.loadLocation?.province ?? "",
        loadLocationCountry: source.loadLocation?.country ?? "España",
        loadDate: "", // reset — the operator sets the new dates
        unloadLocationName: source.unloadLocation?.name ?? "",
        unloadLocationAddress: source.unloadLocation?.address ?? "",
        unloadLocationPostalCode: source.unloadLocation?.postalCode ?? "",
        unloadLocationCity: source.unloadLocation?.city ?? "",
        unloadLocationProvince: source.unloadLocation?.province ?? "",
        unloadLocationCountry: source.unloadLocation?.country ?? "España",
        unloadDate: "",
        goods: source.goods ?? "",
        weight: source.weight ?? "",
        tractorPlate: source.tractorPlate ?? "",
        trailerPlate: source.trailerPlate ?? "",
        reference: "",
      };
    }
  }

  // DESIGN #51: the creator was a mobile-width form stretched across the
  // whole desktop viewport — no desktop-specific richness. A lg+ sticky side
  // panel now uses the extra width to reinforce what the wizard produces,
  // reusing the exact same real-QR `DecaPreview` visual already established
  // on the landing (never a fake/decorative QR).
  const dict = await getDictionary();
  const previewQr = await qrPngDataUriCached(publicEnv.baseUrl);

  return (
    <>
      <SiteHeader authed={!!user?.companyId} companyName={user?.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="mx-auto w-full max-w-[720px] lg:mx-0">
            <CrearWizard
              initial={initial}
              saved={saved}
              templates={templates}
              authed={!!user?.companyId}
              emailVerified={!!user?.emailVerifiedAt}
              company={
                user?.company
                  ? {
                      name: user.company.name,
                      nif: user.company.nif,
                      address: user.company.address,
                    }
                  : undefined
              }
            />
          </div>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <p className="text-sm font-bold text-[var(--color-text-muted)]">
              {dict.crear.previewHeading}
            </p>
            <div className="mt-4">
              <DecaPreview qrDataUri={previewQr} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
