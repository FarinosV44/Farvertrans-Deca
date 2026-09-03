import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser } from "@/lib/auth";
import { listHistory } from "@/lib/data/history";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historial", robots: { index: false } };

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const sp = await searchParams;
  const rows = await listHistory(user.companyId, { q: sp.q, from: sp.from, to: sp.to });

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1000px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Historial</h1>
        <AppNav current="historico" />

        <form className="mt-6 flex flex-wrap items-end gap-3" role="search">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="q" className="block text-sm font-medium">
              Buscar
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Referencia, empresa, matrícula, origen o destino"
              className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          <div>
            <label htmlFor="from" className="block text-sm font-medium">
              Desde
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={sp.from ?? ""}
              className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium">
              Hasta
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={sp.to ?? ""}
              className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)]"
          >
            Filtrar
          </button>
          {(sp.q || sp.from || sp.to) && (
            <Link href="/panel/historico" className="text-sm">
              Limpiar
            </Link>
          )}
        </form>

        <p className="mt-4 text-sm text-[var(--color-text-muted)]" role="status">
          {rows.length} {rows.length === 1 ? "documento" : "documentos"}
        </p>

        {/* Desktop table / mobile cards from the same data */}
        <div className="mt-2 overflow-x-auto">
          <table className="hidden w-full text-sm md:table" data-testid="historico-table">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="py-2">Fecha</th>
                <th>Origen → Destino</th>
                <th>Transportista</th>
                <th>Matrícula</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2">
                    {r.transportDate || r.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td>
                    {r.origin} → {r.destination}
                  </td>
                  <td>{r.carrier}</td>
                  <td>{r.tractorPlate}</td>
                  <td>{r.status}</td>
                  <td className="whitespace-nowrap">
                    <Link href={`/crear/${r.id}`}>Ver</Link> ·{" "}
                    <Link href={`/crear?from=${r.id}`}>Duplicar</Link> ·{" "}
                    <a
                      href={`${publicEnv.baseUrl}/d/${r.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="font-medium">
                  {r.origin} → {r.destination}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {r.transportDate || r.createdAt.toISOString().slice(0, 10)} · {r.carrier} ·{" "}
                  {r.tractorPlate} · {r.status}
                </p>
                <p className="mt-1">
                  <Link href={`/crear/${r.id}`}>Ver</Link> ·{" "}
                  <Link href={`/crear?from=${r.id}`}>Duplicar</Link> ·{" "}
                  <a
                    href={`${publicEnv.baseUrl}/d/${r.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {rows.length === 0 && (
          <p className="mt-6 text-sm text-[var(--color-text-muted)]">
            Sin resultados. <Link href="/crear">Crear un DeCA</Link>.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
