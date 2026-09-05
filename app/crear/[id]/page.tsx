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
      <main id="contenido" className="mx-auto max-w-[680px] px-4 py-12 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-success)] text-white">
            ✓
          </span>
          <div>
            <h1 className="text-2xl font-bold">{t.result.heading}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {formatLocationShort(c.data.loadLocation)} →{" "}
              {formatLocationShort(c.data.unloadLocation)} · {doc.reference}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {t.result.versionGenerated(c.versionNo, fmt(doc.createdAt))}
        </p>

        <ResultActions
          publicUrl={c.publicUrl}
          claimToken={claim}
          versionNo={c.versionNo}
          pdfSha256={c.pdfSha256}
        />

        <div className="mt-8 space-y-8">
          <QrCard qrDataUri={qr} publicUrl={c.publicUrl} versionNo={c.versionNo} />

          <section aria-labelledby="datos-h">
            <h2 id="datos-h" className="mb-3 text-base font-bold">
              {t.result.documentData}
            </h2>
            <DocSummary data={c.data} />
          </section>

          <VersionTimeline versions={doc.versions} />
        </div>

        <p className="mt-8 text-xs text-[var(--color-text-muted)]">{t.result.retentionNotice}</p>
        <p className="mt-4 text-sm">
          <Link href="/crear">{t.result.createAnother}</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
