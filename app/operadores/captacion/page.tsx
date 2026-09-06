import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ProspectManager } from "@/components/app/prospect-manager";
import { requireInternal } from "@/lib/admin/guard";
import { acquisitionFunnel, listProspects } from "@/lib/growth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Captación", robots: { index: false, follow: false } };

export default async function CaptacionPage() {
  const user = await requireInternal();

  const [{ byOperator, totals }, prospects] = await Promise.all([
    acquisitionFunnel(),
    listProspects(),
  ]);

  return (
    <>
      <SiteHeader authed={!!user?.companyId} companyName={user?.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Captación de empresas</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Sembrado y seguimiento de empresas por operador. La métrica de éxito es{" "}
          <strong>activadas</strong> (han generado su primer DeCA), no las altas.{" "}
          <Link href="/operadores">Ver métricas de uso →</Link>
        </p>

        <section className="mt-6" aria-labelledby="funnel">
          <h2 id="funnel" className="text-lg font-bold">
            Embudo por operador
          </h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm" data-testid="funnel-table">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                  <th className="py-2">Operador</th>
                  <th>Prospectos</th>
                  <th>Invitados</th>
                  <th>Registrados</th>
                  <th>Activadas</th>
                  <th>Activas 7d</th>
                  <th>DeCA totales</th>
                </tr>
              </thead>
              <tbody>
                {byOperator.map((f) => (
                  <tr key={f.refCode} className="border-b border-[var(--color-border)]">
                    <td className="py-2 font-medium">{f.refCode}</td>
                    <td>{f.prospects}</td>
                    <td>{f.invited}</td>
                    <td>{f.registered}</td>
                    <td className="font-bold">{f.activated}</td>
                    <td>{f.active7d}</td>
                    <td>{f.totalDeca}</td>
                  </tr>
                ))}
                <tr className="text-sm font-bold">
                  <td className="py-2">{totals.refCode}</td>
                  <td>{totals.prospects}</td>
                  <td>{totals.invited}</td>
                  <td>{totals.registered}</td>
                  <td>{totals.activated}</td>
                  <td>{totals.active7d}</td>
                  <td>{totals.totalDeca}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <ProspectManager
          prospects={prospects.map((p) => ({
            id: p.id,
            name: p.name,
            nif: p.nif,
            email: p.email,
            refCode: p.refCode,
            status: p.status,
            registeredAt: p.registeredAt?.toISOString() ?? null,
            firstDecaAt: p.firstDecaAt?.toISOString() ?? null,
            lastDecaAt: p.lastDecaAt?.toISOString() ?? null,
          }))}
        />
      </main>
      <SiteFooter />
    </>
  );
}
