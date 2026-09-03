import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { operatorStats, type OperatorRow } from "@/lib/attribution/persist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operadores", robots: { index: false, follow: false } };

const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : "—");

export default async function OperadoresPage() {
  const user = await getCurrentUser();
  // Non-internal users must not discover the dashboard content.
  if (user?.role !== "internal") notFound();

  const stats = await operatorStats();
  const rows: OperatorRow[] = [...stats.operators, ...stats.unknown, stats.organic];

  return (
    <>
      <SiteHeader authed={!!user?.companyId} companyName={user?.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Captación por operador</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Métricas de uso real: visitas de eventos y DeCA generados por las empresas captadas. Solo
          lectura.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="py-2">Operador</th>
                <th>Visitas</th>
                <th>Empresas</th>
                <th>Primer DeCA</th>
                <th>DeCA totales</th>
                <th>Activas 7d</th>
                <th>Activas 30d</th>
                <th>Visita→empresa</th>
                <th>Empresa→1er DeCA</th>
                <th>Empresa→activa 30d</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.refCode} className="border-b border-[var(--color-border)]">
                  <td className="py-2">
                    <span className="font-medium">{r.name}</span>
                    {r.active === false && r.refCode !== stats.organic.refCode && (
                      <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                        (inactivo)
                      </span>
                    )}
                    <br />
                    <span className="text-xs text-[var(--color-text-muted)]">{r.refCode}</span>
                  </td>
                  <td>{r.visits}</td>
                  <td>{r.companies}</td>
                  <td>{r.firstDeca}</td>
                  <td>{r.totalDeca}</td>
                  <td>{r.active7d}</td>
                  <td>{r.active30d}</td>
                  <td>{pct(r.companies, r.visits)}</td>
                  <td>{pct(r.firstDeca, r.companies)}</td>
                  <td>{pct(r.active30d, r.companies)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          «Empresas» son altas atribuidas a ese código (first-touch). Una empresa que se registra
          pero nunca genera un DeCA tiene «Primer DeCA» = 0 y «Activas» = 0.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
