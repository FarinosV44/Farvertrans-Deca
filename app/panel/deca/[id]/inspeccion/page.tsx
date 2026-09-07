import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { getDecaCockpit } from "@/lib/deca/detail";
import { qrPngDataUriCached } from "@/lib/pdf/qr";
import { DECA_ROLES } from "@/lib/deca/roles";
import { Wordmark } from "@/components/brand/wordmark";
import { InspectionActions } from "@/components/deca/inspection-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modo inspección", robots: { index: false } };

/**
 * Modo Inspección (#69) — a clean, high-contrast view of the DeCA version
 * CURRENTLY IN FORCE, for showing to a road inspector in one tap. Everything is
 * read from the stored current version (`getDecaCockpit`), never from form
 * state; nothing here is editable; no hashes / DB ids / support data are shown.
 * The legal `/d/[token]` URL and the PDF QR are untouched — this is an extra
 * operational view inside the panel, not an interstitial. Spanish-only, like
 * the PDF and the DECA_ROLES terminology (a legal-inspection artifact).
 */
const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

function place(loc?: { city?: string; province?: string; name?: string }) {
  if (!loc) return "—";
  const town = [loc.city, loc.province && `(${loc.province})`].filter(Boolean).join(" ");
  return town || loc.name || "—";
}

export default async function InspeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const { id } = await params;
  const doc = await getDecaCockpit(id, { companyId: user.companyId });
  if (!doc) notFound();

  const c = doc.current;
  const corrected = c.versionNo > 1;
  const qr = await qrPngDataUriCached(c.publicUrl);
  const d = c.data;

  const rows: [string, string, string?][] = [
    [DECA_ROLES.shipper.title, d.shipper?.name ?? "—", d.shipper?.nif ?? undefined],
    [DECA_ROLES.carrier.title, d.carrier?.name ?? "—", d.carrier?.nif ?? undefined],
    ["Origen → destino", `${place(d.loadLocation)} → ${place(d.unloadLocation)}`],
    [
      "Fecha del transporte",
      d.loadDate && d.unloadDate && d.loadDate !== d.unloadDate
        ? `${d.loadDate} → ${d.unloadDate}`
        : (d.loadDate ?? d.unloadDate ?? "—"),
    ],
    ["Matrícula tractora", d.tractorPlate || "—"],
    ...(d.trailerPlate ? ([["Matrícula remolque", d.trailerPlate]] as [string, string][]) : []),
  ];

  return (
    <main className="mx-auto min-h-screen max-w-[480px] px-4 py-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/panel/deca/${doc.id}`}
          className="text-sm font-medium text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
        >
          ← Volver
        </Link>
        <Wordmark size={20} />
      </div>

      <section
        data-testid="inspection-card"
        data-version={c.versionNo}
        className="mt-4 rounded-[var(--radius-lg)] border-2 border-[var(--color-text)] bg-white p-5"
      >
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          <span className="h-[3px] w-6 bg-[var(--color-primary)]" />
          Modo inspección
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p
              data-testid="inspection-status"
              className={`text-3xl font-bold tracking-tight ${
                corrected ? "text-[var(--color-warn)]" : "text-[var(--color-success)]"
              }`}
            >
              {corrected ? "CORREGIDO" : "VIGENTE"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Versión {c.versionNo} · en vigor
            </p>
          </div>
          {qr && (
            <Image
              src={qr}
              alt="Código QR del documento vigente"
              width={96}
              height={96}
              unoptimized
              className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            />
          )}
        </div>

        <dl className="mt-4 divide-y divide-[var(--color-border)] border-t-2 border-[var(--color-text)]">
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-xs font-medium text-[var(--color-text-muted)]">Referencia</dt>
            <dd className="font-mono text-sm font-semibold">{doc.reference}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-xs font-medium text-[var(--color-text-muted)]">Generado</dt>
            <dd className="text-sm">{fmtDateTime(c.createdAt)}</dd>
          </div>
          {rows.map(([label, value, sub]) => (
            <div key={label} className="py-2">
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">{label}</dt>
              <dd className="mt-0.5 text-base font-semibold break-words">
                {value}
                {sub && (
                  <span className="ml-2 font-mono text-xs font-normal text-[var(--color-text-muted)]">
                    {sub}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <InspectionActions publicUrl={c.publicUrl} reference={doc.reference} />
      </section>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        Modo inspección · Incluido gratis durante el lanzamiento
      </p>
    </main>
  );
}
