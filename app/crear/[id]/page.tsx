import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { publicEnv } from "@/lib/env";
import { ResultActions } from "@/components/deca/result-actions";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ claim?: string }>;
}) {
  const { id } = await params;
  const { claim } = await searchParams;

  const { prisma } = await import("@/lib/prisma");
  const deca = await prisma.deca.findUnique({
    where: { id },
    include: { currentVersion: true },
  });
  if (!deca || !deca.currentVersion) notFound();

  const publicUrl = `${publicEnv.baseUrl}/d/${deca.currentVersion.token}`;
  const data = deca.currentVersion.dataJson as Record<string, unknown> & {
    origin?: string;
    destination?: string;
  };

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[640px] px-4 py-12 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-success)] text-white">
            ✓
          </span>
          <div>
            <h1 className="text-2xl font-bold">DeCA generado</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {String(data.origin ?? "")} → {String(data.destination ?? "")}
            </p>
          </div>
        </div>

        <ResultActions publicUrl={publicUrl} claimToken={claim} />

        <p className="mt-8 text-xs text-[var(--color-text-muted)]">
          Documento conservado durante al menos 1 año. La URL pública permite la descarga directa del PDF
          sin registro, conforme a la resolución vigente.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/crear">Crear otro DeCA</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
