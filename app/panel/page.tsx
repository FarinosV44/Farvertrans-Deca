import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser } from "@/lib/auth";
import { listHistory } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { publicEnv } from "@/lib/env";
import {
  PlusIcon,
  CopyIcon,
  DocumentIcon,
  BuildingIcon,
  TruckIcon,
  IconBadge,
} from "@/components/panel/icons";

export const dynamic = "force-dynamic";

// Registered workspace (BUILD 10) — actions first, no vanity dashboard.
export default async function AppHome() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const [rows, saved] = await Promise.all([listHistory(user.companyId), listSaved(user.companyId)]);
  const recent = rows.slice(0, 5);
  const last = rows[0];

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[900px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{user.company?.name ?? "Mi empresa"}</h1>
        <AppNav current="home" />

        {!user.emailVerifiedAt && (
          <div
            role="status"
            data-testid="panel-verify-email-banner"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm"
          >
            <p>
              <span aria-hidden>✉️</span> Aún no has confirmado tu correo ({user.email}).
            </p>
            <Link
              href="/verificar-email?next=/panel"
              className="font-medium text-[var(--color-primary)] underline"
            >
              Confirmar ahora
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/crear"
            data-testid="app-crear"
            className="flex min-h-16 items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-5 py-4 font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            <PlusIcon />
            Nuevo DeCA
          </Link>
          {last && (
            <Link
              href={`/crear?from=${last.id}`}
              data-testid="app-repetir"
              className="flex min-h-16 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 font-medium text-[var(--color-text)] no-underline"
            >
              <IconBadge>
                <CopyIcon />
              </IconBadge>
              Repetir / duplicar último DeCA
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
            <ul className="mt-3 space-y-2">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
                >
                  <IconBadge>
                    <DocumentIcon />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {r.loadLocation} → {r.unloadLocation}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {r.loadDate || r.createdAt.toISOString().slice(0, 10)} · {r.carrier} ·{" "}
                      {r.tractorPlate}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <Link href={`/panel/deca/${r.id}`}>Detalle</Link>
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
            Icon={BuildingIcon}
          />
          <SummaryCard
            title="Vehículos habituales"
            count={saved.vehicles.length}
            href="/panel/datos"
            Icon={TruckIcon}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SummaryCard({
  title,
  count,
  href,
  Icon,
}: {
  title: string;
  count: number;
  href: string;
  Icon: (props: { width?: number; height?: number }) => React.JSX.Element;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 no-underline"
    >
      <IconBadge size={48}>
        <Icon width={22} height={22} />
      </IconBadge>
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="mt-1 text-2xl font-bold">{count}</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Gestionar datos habituales →</p>
      </div>
    </Link>
  );
}
