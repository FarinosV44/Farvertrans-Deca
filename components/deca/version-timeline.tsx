import type { CockpitVersion } from "@/lib/deca/detail";

const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 16) + " UTC";

/**
 * Version history for a DeCA (PRODUCT #36 §5). Each row links to that version's
 * own PDF / public inspection URL. Previous versions are never overwritten.
 * `showAuthor` is on only in the authenticated workspace view.
 */
export function VersionTimeline({
  versions,
  showAuthor = false,
  alwaysShow = false,
}: {
  versions: CockpitVersion[];
  showAuthor?: boolean;
  /** Workspace view keeps the history visible even for a single version. */
  alwaysShow?: boolean;
}) {
  if (versions.length <= 1 && !alwaysShow) return null;
  return (
    <section aria-labelledby="versiones-h">
      <h2 id="versiones-h" className="text-base font-bold">
        Historial de versiones
      </h2>
      <ol className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {versions.map((v) => (
          <li
            key={v.versionNo}
            data-testid={`version-row-${v.versionNo}`}
            className="flex flex-wrap items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Versión {v.versionNo}
                {v.isCurrent ? (
                  <span className="ml-2 rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] px-2 py-0.5 text-xs text-[var(--color-success)]">
                    vigente
                  </span>
                ) : (
                  <span className="ml-2 rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                    sustituida
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {fmt(v.createdAt)}
                {v.changeReason ? ` · ${v.changeReason}` : ""}
                {showAuthor && v.author ? ` · por ${v.author}` : ""}
              </p>
            </div>
            <a
              href={v.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm no-underline"
            >
              Ver PDF
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Cada corrección genera una versión nueva con su propio QR y URL. Las versiones anteriores no
        se borran y siguen siendo consultables.
      </p>
    </section>
  );
}

/** "Qué ha cambiado" — field-level diff of the current version vs the previous (#36 §6). */
export function ChangeList({
  changes,
}: {
  changes: { label: string; from: string; to: string }[];
}) {
  if (changes.length === 0) return null;
  return (
    <section aria-labelledby="cambios-h" data-testid="change-list">
      <h2 id="cambios-h" className="text-base font-bold">
        Qué ha cambiado en esta versión
      </h2>
      <div className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-3 py-2 font-medium">Campo</th>
              <th className="px-3 py-2 font-medium">Antes</th>
              <th className="px-3 py-2 font-medium">Ahora</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((c) => (
              <tr key={c.label} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 align-top font-medium">{c.label}</td>
                <td className="px-3 py-2 align-top text-[var(--color-text-muted)] line-through">
                  {c.from}
                </td>
                <td className="px-3 py-2 align-top">{c.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
