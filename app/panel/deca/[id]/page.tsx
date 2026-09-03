import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { ResultActions } from "@/components/deca/result-actions";
import { getCurrentUser } from "@/lib/auth";
import { getDecaDetail } from "@/lib/data/history";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documento", robots: { index: false } };

export default async function DecaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const { id } = await params;
  const deca = await getDecaDetail(user.companyId, id);
  if (!deca) notFound();

  const d = deca.current.data;
  const publicUrl = `${publicEnv.baseUrl}/d/${deca.current.token}`;

  return (
    <>
      <SiteHeader authed />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">
          {String(d.origin ?? "")} → {String(d.destination ?? "")}
        </h1>
        <AppNav current="historico" />

        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Versión actual: {deca.current.versionNo} · Transportista: {String(d.carrier?.name ?? "")}{" "}
          · Matrícula: {String(d.tractorPlate ?? "")}
        </p>

        <ResultActions publicUrl={publicUrl} />

        <div className="mt-6">
          <Link
            href={`/panel/deca/${deca.id}/corregir`}
            data-testid="deca-corregir"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-4 font-medium text-[var(--color-primary)] no-underline"
          >
            Corregir
          </Link>
        </div>

        <section className="mt-8" aria-labelledby="versiones">
          <h2 id="versiones" className="text-lg font-bold">
            Historial de versiones
          </h2>
          <ul className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] text-sm">
            {deca.versions.map((v) => (
              <li key={v.versionNo} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <span className="font-medium">Versión {v.versionNo}</span>
                  {v.isCurrent && (
                    <span className="ml-2 rounded-[4px] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs">
                      actual
                    </span>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {v.createdAt.toISOString().replace("T", " ").slice(0, 16)} UTC
                    {v.changeReason ? ` · ${v.changeReason}` : ""}
                    {v.author ? ` · por ${v.author}` : ""}
                  </p>
                </div>
                <a
                  href={`${publicEnv.baseUrl}/d/${v.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver PDF
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Cada corrección genera una versión nueva con su propio QR y URL. Las versiones
            anteriores no se borran.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
