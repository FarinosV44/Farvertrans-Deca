import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser } from "@/lib/auth";
import { listHistory } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// Registered workspace (BUILD 10) — actions first, no vanity dashboard.
export default async function AppHome() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const [rows, saved] = await Promise.all([listHistory(user.companyId), listSaved(user.id)]);
  const recent = rows.slice(0, 5);
  const last = rows[0];

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[900px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{user.company?.name ?? "Mi empresa"}</h1>
        <AppNav current="home" />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/crear"
            data-testid="app-crear"
            className="min-h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-3 font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            + Crear DeCA
          </Link>
          {last && (
            <Link
              href={`/crear?from=${last.id}`}
              data-testid="app-repetir"
              className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 py-3 font-medium text-[var(--color-primary)] no-underline"
            >
              Repetir último DeCA
            </Link>
          )}
        </div>

        <section className="mt-8" aria-labelledby="ultimos">
          <div className="flex items-center justify-between">
            <h2 id="ultimos" className="text-lg font-bold">
              Últimos documentos
            </h2>
            {rows.length > 5 && (
              <Link href="/panel/historico" className="text-sm">
                Ver todo el historial
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
              Aún no tienes documentos. <Link href="/crear">Crea tu primer DeCA</Link>.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {r.origin} → {r.destination}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {r.transportDate || r.createdAt.toISOString().slice(0, 10)} · {r.carrier} ·{" "}
                      {r.tractorPlate}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Link href={`/crear/${r.id}`}>Ver</Link>
                    <Link href={`/crear?from=${r.id}`}>Duplicar</Link>
                    <a
                      href={`${publicEnv.baseUrl}/d/${r.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <SummaryCard
            title="Empresas / transportistas habituales"
            count={saved.companies.length}
            href="/panel/datos"
          />
          <SummaryCard
            title="Vehículos habituales"
            count={saved.vehicles.length}
            href="/panel/datos"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SummaryCard({ title, count, href }: { title: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 no-underline"
    >
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mt-1 text-2xl font-bold">{count}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Gestionar datos habituales →</p>
    </Link>
  );
}
