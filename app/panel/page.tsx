import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { RowShare } from "@/components/deca/row-share";
import { getCurrentUser } from "@/lib/auth";
import { listHistory } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { getTopRoutes } from "@/lib/data/route-intel";
import { listCompanyTeamActivity } from "@/lib/admin/audit-log";
import { publicEnv } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/server";
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

  // PRODUCT #56 "Company dashboard improvements" — team activity, owner-only
  // (the same audience as the invite/role-management UI on /panel/equipo):
  // members don't manage the team, so this would be noise for them.
  const isOwner = user.companyRole === "owner";
  const [rows, saved, topRoutes, teamActivity] = await Promise.all([
    listHistory(user.companyId),
    listSaved(user.companyId),
    getTopRoutes(user.companyId, 4),
    isOwner ? listCompanyTeamActivity(user.companyId, 5) : Promise.resolve([]),
  ]);
  const recent = rows.slice(0, 5);
  const last = rows[0];
  const t = await getDictionary();
  // PRODUCT #56: a read_only (Auditor) member sees the same history/data, but
  // never the create/duplicate actions — the server-side gate on every
  // mutating route is what actually enforces this; hiding the buttons here
  // is UX only, so a read_only user never hits a confusing 403.
  const canCreate = user.companyRole !== "read_only";

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold md:text-3xl">
          {user.company?.name ?? t.panel.myCompanyFallback}
        </h1>
        <AppNav current="home" />

        {!user.emailVerifiedAt && (
          <div
            role="status"
            data-testid="panel-verify-email-banner"
            className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-r-[var(--radius-sm)] border-l-[3px] border-[var(--color-warn)] bg-[var(--color-warn-bg)] p-3.5 text-sm"
          >
            <p>{t.panel.verifyBanner.text(user.email)}</p>
            <Link
              href="/verificar-email?next=/panel"
              className="font-semibold text-[var(--color-primary)] underline"
            >
              {t.panel.verifyBanner.cta}
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px] md:items-start md:gap-10">
          <div>
            {canCreate && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/crear"
                  data-testid="app-crear"
                  className="flex min-h-16 items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-5 py-4 font-medium text-[var(--color-primary-contrast)] no-underline"
                >
                  <PlusIcon />
                  {t.panel.newDeca}
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
                    {t.panel.duplicateLast}
                  </Link>
                )}
              </div>
            )}

            <section className="mt-8" aria-labelledby="ultimos">
              <div className="flex items-center justify-between">
                <h2 id="ultimos" className="text-lg font-bold">
                  {t.panel.lastDocuments}
                </h2>
                {rows.length > 5 && (
                  <Link href="/panel/historico" className="text-sm">
                    {t.panel.viewAllHistory}
                  </Link>
                )}
              </div>
              {recent.length === 0 ? (
                <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
                  {t.panel.noDocumentsYet}
                  {canCreate && (
                    <>
                      {" "}
                      <Link href="/crear">{t.panel.createFirst}</Link>.
                    </>
                  )}
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
                      <div className="flex shrink-0 items-center gap-3 text-xs">
                        <Link href={`/panel/deca/${r.id}`}>{t.panel.detail}</Link>
                        <RowShare
                          publicUrl={`${publicEnv.baseUrl.replace(/\/$/, "")}/d/${r.token}`}
                          reference={r.reference}
                        />
                        {canCreate && <Link href={`/crear?from=${r.id}`}>{t.panel.duplicate}</Link>}
                        <a
                          href={`${publicEnv.baseUrl}/d/${r.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.panel.pdf}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <SummaryCard
                title={t.panel.companiesCard}
                manageLabel={t.panel.manageData}
                count={saved.companies.length}
                href="/panel/datos"
                Icon={BuildingIcon}
              />
              <SummaryCard
                title={t.panel.vehiclesCard}
                manageLabel={t.panel.manageData}
                count={saved.vehicles.length}
                href="/panel/datos"
                Icon={TruckIcon}
              />
            </div>

            {topRoutes.length > 0 && (
              <section aria-labelledby="rutas-frecuentes">
                <h2 id="rutas-frecuentes" className="text-sm font-bold">
                  Rutas frecuentes
                </h2>
                <ul className="mt-2 space-y-2" data-testid="frequent-routes">
                  {topRoutes.map((r) => (
                    <li
                      key={r.key}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
                    >
                      <p className="font-medium">
                        {r.loadCity} → {r.unloadCity}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {r.count} {r.count === 1 ? "DeCA" : "DeCA"}
                      </p>
                      {canCreate && (
                        <Link
                          href={`/crear?from=${r.lastDecaId}`}
                          className="mt-1 inline-block text-xs font-medium text-[var(--color-primary)]"
                        >
                          Crear DeCA en esta ruta →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {isOwner && teamActivity.length > 0 && (
              <section aria-labelledby="actividad-equipo">
                <h2 id="actividad-equipo" className="text-sm font-bold">
                  {t.panel.teamActivity.heading}
                </h2>
                <ul className="mt-2 space-y-2" data-testid="team-activity">
                  {teamActivity.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
                    >
                      <p>{formatTeamActivity(a, t.panel.teamActivity)}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {a.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function formatTeamActivity(
  a: {
    action: string;
    actorEmail: string | null;
    targetEmail: string | null;
    targetType: string | null;
  },
  dict: {
    invited: (actor: string) => string;
    joined: (actor: string) => string;
    roleChanged: (actor: string, target: string, role: string) => string;
    removed: (actor: string, target: string) => string;
    roleLabel: Record<string, string>;
  },
): string {
  const actor = a.actorEmail ?? "—";
  const target = a.targetEmail ?? "—";
  switch (a.action) {
    case "team_invite_created":
      return dict.invited(actor);
    case "team_invite_accepted":
      return dict.joined(actor);
    case "team_role_changed":
      return dict.roleChanged(
        actor,
        target,
        dict.roleLabel[a.targetType ?? ""] ?? a.targetType ?? "",
      );
    case "team_member_removed":
      return dict.removed(actor, target);
    default:
      return a.action;
  }
}

function SummaryCard({
  title,
  manageLabel,
  count,
  href,
  Icon,
}: {
  title: string;
  manageLabel: string;
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
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{manageLabel}</p>
      </div>
    </Link>
  );
}
