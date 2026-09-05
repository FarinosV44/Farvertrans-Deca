import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ResultActions } from "@/components/deca/result-actions";
import { DocSummary } from "@/components/deca/doc-summary";
import { QrCard } from "@/components/deca/qr-card";
import { VersionTimeline } from "@/components/deca/version-timeline";
import { TrackView } from "@/components/analytics/track-view";
import { getDecaCockpit } from "@/lib/deca/detail";
import { qrPngDataUriCached } from "@/lib/pdf/qr";
import { formatLocationShort } from "@/lib/deca/location";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 16) + " UTC";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ claim?: string }>;
}) {
  const { id } = await params;
  const { claim } = await searchParams;

  const doc = await getDecaCockpit(id);
  if (!doc) notFound();

  const c = doc.current;
  const qr = await qrPngDataUriCached(c.publicUrl);
  const t = await getDictionary();

  return (
    <>
      <TrackView event="deca_generated" />
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1120px] px-4 py-12 md:px-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--color-success)] text-2xl text-white shadow-[0_6px_18px_rgba(20,150,90,0.28)]">
            ✓
          </span>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{t.result.heading}</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] md:text-base">
              {formatLocationShort(c.data.loadLocation)} →{" "}
              {formatLocationShort(c.data.unloadLocation)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1">
            {doc.reference}
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1">
            {t.result.version} {c.versionNo}
          </span>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] px-3 py-1 text-[var(--color-success)]">
            {t.result.versionGenerated(c.versionNo, fmt(doc.createdAt))}
          </span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_380px] md:items-start md:gap-10">
          <div className="space-y-8 md:order-2">
            <ResultActions
              publicUrl={c.publicUrl}
              claimToken={claim}
              versionNo={c.versionNo}
              pdfSha256={c.pdfSha256}
            />
            <QrCard qrDataUri={qr} publicUrl={c.publicUrl} versionNo={c.versionNo} />
          </div>

          <div className="space-y-8 md:order-1">
            <section aria-labelledby="datos-h">
              <h2 id="datos-h" className="mb-3 text-base font-bold">
                {t.result.documentData}
              </h2>
              <DocSummary data={c.data} />
            </section>

            <VersionTimeline versions={doc.versions} />

            <p className="text-xs text-[var(--color-text-muted)]">{t.result.retentionNotice}</p>
            <p className="text-sm">
              <Link href="/crear">{t.result.createAnother}</Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
