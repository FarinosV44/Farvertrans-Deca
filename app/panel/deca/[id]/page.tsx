import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { ResultActions } from "@/components/deca/result-actions";
import { SaveTemplate } from "@/components/deca/save-template";
import { DocSummary } from "@/components/deca/doc-summary";
import { QrCard } from "@/components/deca/qr-card";
import { VersionTimeline, ChangeList } from "@/components/deca/version-timeline";
import { getCurrentUser } from "@/lib/auth";
import { getDecaCockpit } from "@/lib/deca/detail";
import { qrPngDataUri } from "@/lib/pdf/qr";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documento", robots: { index: false } };

const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 16) + " UTC";

export default async function DecaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const { id } = await params;
  const doc = await getDecaCockpit(id, { companyId: user.companyId });
  if (!doc) notFound();

  const c = doc.current;
  const qr = await qrPngDataUri(c.publicUrl);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[760px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">
          {c.data.origin ?? ""} → {c.data.destination ?? ""}
        </h1>
        <AppNav current="historico" />

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
          <span className="font-mono">{doc.reference}</span>
          <span aria-hidden>·</span>
          <span>Versión actual: {c.versionNo}</span>
          <span aria-hidden>·</span>
          <span
            className={
              doc.status === "activo"
                ? "rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] px-2 py-0.5 text-xs text-[var(--color-success)]"
                : "rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs"
            }
          >
            {doc.status === "activo" ? "URL pública activa" : "URL pública no disponible"}
          </span>
          <span aria-hidden>·</span>
          <span>Servicio {c.data.transportDate ?? "—"}</span>
          <span aria-hidden>·</span>
          <span>Generado {fmt(doc.createdAt)}</span>
        </div>

        <ResultActions
          publicUrl={c.publicUrl}
          versionNo={c.versionNo}
          pdfSha256={c.pdfSha256}
          correctedReminder={c.versionNo > 1}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/panel/deca/${doc.id}/corregir`}
            data-testid="deca-corregir"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 font-medium text-[var(--color-primary)] no-underline"
          >
            Corregir
          </Link>
          <Link
            href={`/crear?from=${doc.id}`}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium no-underline"
          >
            Duplicar
          </Link>
          <SaveTemplate data={c.data} />
        </div>

        <div className="mt-8 space-y-8">
          <QrCard qrDataUri={qr} publicUrl={c.publicUrl} versionNo={c.versionNo} />

          <section aria-labelledby="datos-h">
            <h2 id="datos-h" className="mb-3 text-base font-bold">
              Datos del documento
            </h2>
            <DocSummary data={c.data} />
          </section>

          {doc.changes && doc.changes.length > 0 && <ChangeList changes={doc.changes} />}

          <VersionTimeline versions={doc.versions} showAuthor alwaysShow />

          <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <summary className="cursor-pointer text-sm font-medium">Detalles técnicos</summary>
            <dl className="mt-2 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Referencia interna</dt>
                <dd className="font-mono text-xs">{doc.reference}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Hash del PDF (SHA-256)</dt>
                <dd className="font-mono text-xs break-all">{c.pdfSha256 || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Token público</dt>
                <dd className="font-mono text-xs break-all">{c.token}</dd>
              </div>
            </dl>
          </details>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
