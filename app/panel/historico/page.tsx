import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { RowShare } from "@/components/deca/row-share";
import { RowMenu } from "@/components/deca/row-menu";
import { getCurrentUser } from "@/lib/auth";
import { listHistory, listHistoryCarriers } from "@/lib/data/history";
import { listViews } from "@/lib/data/saved-views";
import { filtersFromParams, hasActiveFilters, MAX_HISTORY_VIEWS } from "@/lib/data/history-views";
import { SavedViews } from "@/components/panel/saved-views";
import { docWorkflowStatus } from "@/lib/deca/export";
import { publicEnv } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/server";
import type { Messages } from "@/lib/i18n/dictionaries/es";
import { Pill, type PillTone, EmptyState } from "@/components/ui";

/** Maps the (Spanish, CSV-shared) `docWorkflowStatus()` word to the UI locale. */
function statusLabel(raw: string, t: Messages): string {
  if (raw === "Vigente") return t.historico.statusActive;
  if (raw === "Corregida") return t.historico.statusCorrected;
  return t.historico.statusUnavailable;
}
const STATUS_TONE: Record<string, PillTone> = {
  Vigente: "ok",
  Corregida: "warn",
  "No disponible": "rest",
};
function StatusPill({ raw, t }: { raw: string; t: Messages }) {
  return <Pill tone={STATUS_TONE[raw] ?? "rest"}>{statusLabel(raw, t)}</Pill>;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Historial", robots: { index: false } };

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    from?: string;
    to?: string;
    carrier?: string;
    plate?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro/completar-empresa");

  const sp = await searchParams;
  const [rows, carriers, savedViews] = await Promise.all([
    listHistory(user.companyId, {
      q: sp.q,
      from: sp.from,
      to: sp.to,
      carrier: sp.carrier,
      plate: sp.plate,
    }),
    listHistoryCarriers(user.companyId),
    // #92 — this user's own saved views; never the company's.
    listViews(user.id),
  ]);
  const currentFilters = filtersFromParams(sp);
  const t = await getDictionary();
  const active = sp.q || sp.from || sp.to || sp.carrier || sp.plate;
  const exportQuery = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        q: sp.q,
        from: sp.from,
        to: sp.to,
        carrier: sp.carrier,
        plate: sp.plate,
      }).filter(([, v]) => v),
    ) as Record<string, string>,
  ).toString();

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[1000px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{t.historico.title}</h1>
        <AppNav current="historico" />

        {/* #92 — a comfort layer above the filters, never a new section. */}
        <SavedViews
          views={savedViews}
          current={currentFilters}
          params={sp}
          canSave={hasActiveFilters(currentFilters)}
          t={{
            ...t.historico.views,
            // Resolved here: a dictionary function cannot cross into a Client
            // Component. `{name}` is substituted there, where the name is known.
            removeConfirm: t.historico.views.removeConfirm("{name}"),
            limit: t.historico.views.limit(MAX_HISTORY_VIEWS),
          }}
        />

        {/* #114 §1 — same fields/names/behaviour, only alignment/spacing polished. */}
        <form
          className="mt-6 grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:grid-cols-3 sm:items-end md:flex md:flex-wrap"
          role="search"
        >
          <div className="col-span-2 min-w-[200px] sm:col-span-1 md:flex-1">
            <label htmlFor="q" className="block text-sm font-medium">
              {t.historico.search}
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder={t.historico.searchPlaceholder}
              className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          <div>
            <label htmlFor="from" className="block text-sm font-medium">
              {t.historico.from}
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={sp.from ?? ""}
              className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium">
              {t.historico.to}
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={sp.to ?? ""}
              className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
          {carriers.length > 0 && (
            <div>
              <label htmlFor="carrier" className="block text-sm font-medium">
                {t.historico.carrier}
              </label>
              <select
                id="carrier"
                name="carrier"
                defaultValue={sp.carrier ?? ""}
                className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
              >
                <option value="">{t.historico.carrierAll}</option>
                {carriers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="plate" className="block text-sm font-medium">
              {t.historico.plate}
            </label>
            <input
              id="plate"
              name="plate"
              defaultValue={sp.plate ?? ""}
              placeholder="1234 BCD"
              className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 md:w-[120px]"
            />
          </div>
          <div className="col-span-2 flex items-end gap-3 sm:col-span-1 md:col-auto">
            <button
              type="submit"
              className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)]"
            >
              {t.historico.filter}
            </button>
            {active && (
              <Link href="/panel/historico" className="text-sm">
                {t.historico.clear}
              </Link>
            )}
          </div>
        </form>

        {/* #114 §8 — a compact results toolbar; CSV export sits right beside the count, not floating. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-2">
          <p className="text-sm text-[var(--color-text-muted)]" role="status">
            {rows.length}{" "}
            {rows.length === 1 ? t.historico.documentsCountOne : t.historico.documentsCountMany}
          </p>
          {rows.length > 0 && (
            <a
              href={`/api/export/history${exportQuery ? `?${exportQuery}` : ""}`}
              data-testid="export-csv"
              className="inline-flex min-h-9 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium no-underline"
            >
              {t.historico.exportCsv}
            </a>
          )}
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            {/* Desktop table (#114 §2/§3/§7) — kept as a real <table>, restyled: route is the
                dominant first line, date/reference collapse under it, shipper/carrier get
                explicit micro-labels, status+version are one badge cluster. */}
            <table className="hidden w-full text-sm md:table" data-testid="historico-table">
              <thead>
                <tr className="border-b-2 border-[var(--color-text)] text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  <th className="py-2.5 pr-3">{t.historico.colRoute}</th>
                  <th className="pr-3">{t.historico.colShipper}</th>
                  <th className="pr-3">{t.historico.colCarrier}</th>
                  <th className="pr-3">{t.historico.colPlate}</th>
                  <th className="pr-3">{t.historico.colStatus}</th>
                  <th>{t.historico.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--color-border-soft)] align-top hover:bg-[var(--color-surface)]"
                  >
                    <td className="py-3 pr-3">
                      <p className="font-semibold">
                        {r.loadLocation} → {r.unloadLocation}
                        {r.shipmentCount > 1 && (
                          <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">
                            {t.common.shipmentsBadge(r.shipmentCount - 1)}
                          </span>
                        )}
                      </p>
                      {r.extraRoutes.length > 0 && (
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                          {r.extraRoutes.join(" · ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {r.loadDate || r.createdAt.toISOString().slice(0, 10)} · {r.reference}
                      </p>
                    </td>
                    <td className="pr-3 text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-text)]">{r.shipper}</span>
                    </td>
                    <td className="pr-3 text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-text)]">{r.carrier}</span>
                    </td>
                    <td className="pr-3">
                      {r.tractorPlate}
                      {r.trailerPlate ? ` + ${r.trailerPlate}` : ""}
                    </td>
                    <td className="pr-3">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusPill raw={docWorkflowStatus(r)} t={t} />
                        {r.versionNo > 1 ? (
                          <span className="text-xs text-[var(--color-text-muted)]">
                            v{r.versionNo}
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/panel/deca/${r.id}`}
                          className="font-medium text-[var(--color-primary)] underline"
                        >
                          {t.historico.detail}
                        </Link>
                        <Link
                          href={`/panel/deca/${r.id}/inspeccion`}
                          className="text-[var(--color-text-muted)] underline"
                        >
                          {t.historico.inspection}
                        </Link>
                        <RowShare
                          publicUrl={`${publicEnv.baseUrl.replace(/\/$/, "")}/d/${r.token}`}
                          reference={r.reference}
                        />
                        <RowMenu label={t.historico.moreActions}>
                          <Link
                            role="menuitem"
                            href={`/panel/deca/${r.id}/corregir`}
                            className="rounded-[6px] px-2 py-1.5 font-medium text-[var(--color-primary)] no-underline hover:bg-[var(--color-surface)]"
                          >
                            {t.historico.correct}
                          </Link>
                          <Link
                            role="menuitem"
                            href={`/crear?from=${r.id}`}
                            className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
                          >
                            {t.historico.duplicate}
                          </Link>
                          <a
                            role="menuitem"
                            href={`${publicEnv.baseUrl}/d/${r.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
                          >
                            {t.historico.pdf}
                          </a>
                        </RowMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards (#114 §10) — one document per compact card, no compressed table. */}
            <ul
              className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:hidden"
              data-testid="historico-cards"
            >
              {rows.map((r) => (
                <li key={r.id} className="py-3 text-sm">
                  <p className="font-semibold">
                    {r.loadLocation} → {r.unloadLocation}
                    {r.shipmentCount > 1 && (
                      <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">
                        {t.common.shipmentsBadge(r.shipmentCount - 1)}
                      </span>
                    )}
                  </p>
                  {r.extraRoutes.length > 0 && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {r.extraRoutes.join(" · ")}
                    </p>
                  )}
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--color-text-muted)]">
                    <span>{r.loadDate || r.createdAt.toISOString().slice(0, 10)}</span>
                    <StatusPill raw={docWorkflowStatus(r)} t={t} />
                    {r.versionNo > 1 ? <span>v{r.versionNo}</span> : null}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {t.historico.colShipper}:{" "}
                    <span className="text-[var(--color-text)]">{r.shipper}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {t.historico.colCarrier}:{" "}
                    <span className="text-[var(--color-text)]">{r.carrier}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {r.tractorPlate}
                    {r.trailerPlate ? ` + ${r.trailerPlate}` : ""}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/panel/deca/${r.id}`}
                      className="font-medium text-[var(--color-primary)] underline"
                    >
                      {t.historico.detail}
                    </Link>
                    <RowShare
                      publicUrl={`${publicEnv.baseUrl.replace(/\/$/, "")}/d/${r.token}`}
                      reference={r.reference}
                    />
                    <RowMenu label={t.historico.moreActions}>
                      <Link
                        role="menuitem"
                        href={`/panel/deca/${r.id}/inspeccion`}
                        className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
                      >
                        {t.historico.inspection}
                      </Link>
                      <Link
                        role="menuitem"
                        href={`/panel/deca/${r.id}/corregir`}
                        className="rounded-[6px] px-2 py-1.5 font-medium text-[var(--color-primary)] no-underline hover:bg-[var(--color-surface)]"
                      >
                        {t.historico.correct}
                      </Link>
                      <Link
                        role="menuitem"
                        href={`/crear?from=${r.id}`}
                        className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
                      >
                        {t.historico.duplicate}
                      </Link>
                      <a
                        role="menuitem"
                        href={`${publicEnv.baseUrl}/d/${r.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[6px] px-2 py-1.5 no-underline hover:bg-[var(--color-surface)]"
                      >
                        {t.historico.pdf}
                      </a>
                    </RowMenu>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* #114 §11 — a useful empty state, not a bare table: two distinct messages depending on
            whether the company has no DeCA at all yet, or these filters simply matched nothing. */}
        {rows.length === 0 &&
          (active ? (
            <EmptyState
              title={t.historico.noResultsFiltered}
              action={
                <Link
                  href="/panel/historico"
                  className="inline-flex min-h-9 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium no-underline"
                >
                  {t.historico.clearFilters}
                </Link>
              }
            >
              {t.historico.noResultsFilteredHint}
            </EmptyState>
          ) : (
            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
              {t.historico.noResults} <Link href="/crear">{t.historico.createOne}</Link>.
            </p>
          ))}
      </main>
      <SiteFooter />
    </>
  );
}
