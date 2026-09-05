import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser } from "@/lib/auth";
import { listHistory, listHistoryCarriers } from "@/lib/data/history";
import { docWorkflowStatus } from "@/lib/deca/export";
import { publicEnv } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/server";
import type { Messages } from "@/lib/i18n/dictionaries/es";

/** Maps the (Spanish, CSV-shared) `docWorkflowStatus()` word to the UI locale. */
function statusLabel(raw: string, t: Messages): string {
  if (raw === "Vigente") return t.historico.statusActive;
  if (raw === "Corregida") return t.historico.statusCorrected;
  return t.historico.statusUnavailable;
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
  if (!user?.companyId) redirect("/registro");

  const sp = await searchParams;
  const [rows, carriers] = await Promise.all([
    listHistory(user.companyId, {
      q: sp.q,
      from: sp.from,
      to: sp.to,
      carrier: sp.carrier,
      plate: sp.plate,
    }),
    listHistoryCarriers(user.companyId),
  ]);
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

        <form className="mt-6 flex flex-wrap items-end gap-3" role="search">
          <div className="min-w-[200px] flex-1">
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
              className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
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
              className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
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
                className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
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
              className="mt-1 min-h-11 w-[120px] rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
          </div>
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
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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

        {/* Desktop table / mobile cards from the same data */}
        <div className="mt-2 overflow-x-auto">
          <table className="hidden w-full text-sm md:table" data-testid="historico-table">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="py-2">{t.historico.colDate}</th>
                <th>{t.historico.colRoute}</th>
                <th>{t.historico.colShipper}</th>
                <th>{t.historico.colCarrier}</th>
                <th>{t.historico.colPlate}</th>
                <th>{t.historico.colStatus}</th>
                <th>{t.historico.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2">{r.loadDate || r.createdAt.toISOString().slice(0, 10)}</td>
                  <td>
                    {r.loadLocation} → {r.unloadLocation}
                  </td>
                  <td>{r.shipper}</td>
                  <td>{r.carrier}</td>
                  <td>
                    {r.tractorPlate}
                    {r.trailerPlate ? ` + ${r.trailerPlate}` : ""}
                  </td>
                  <td>
                    {statusLabel(docWorkflowStatus(r), t)}
                    {r.versionNo > 1 ? ` · v${r.versionNo}` : ""}
                  </td>
                  <td className="whitespace-nowrap">
                    <Link href={`/panel/deca/${r.id}`}>{t.historico.detail}</Link> ·{" "}
                    <Link href={`/panel/deca/${r.id}/corregir`}>{t.historico.correct}</Link> ·{" "}
                    <Link href={`/crear?from=${r.id}`}>{t.historico.duplicate}</Link> ·{" "}
                    <a
                      href={`${publicEnv.baseUrl}/d/${r.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.historico.pdf}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul
            className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:hidden"
            data-testid="historico-cards"
          >
            {rows.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="font-medium">
                  {r.loadLocation} → {r.unloadLocation}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {r.loadDate || r.createdAt.toISOString().slice(0, 10)} · {r.carrier} ·{" "}
                  {r.tractorPlate} · {statusLabel(docWorkflowStatus(r), t)}
                  {r.versionNo > 1 ? ` · v${r.versionNo}` : ""}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <Link href={`/panel/deca/${r.id}`}>{t.historico.detail}</Link>
                  <Link href={`/panel/deca/${r.id}/corregir`}>{t.historico.correct}</Link>
                  <Link href={`/crear?from=${r.id}`}>{t.historico.duplicate}</Link>
                  <a
                    href={`${publicEnv.baseUrl}/d/${r.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.historico.pdf}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {rows.length === 0 && (
          <p className="mt-6 text-sm text-[var(--color-text-muted)]">
            {t.historico.noResults} <Link href="/crear">{t.historico.createOne}</Link>.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
