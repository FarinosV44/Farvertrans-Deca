import Link from "next/link";
import {
  listCompanySegments,
  SEGMENT_LABEL,
  SEGMENT_RULES,
  type SegmentTag,
} from "@/lib/admin/segments";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");
type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Companies list with rule-based segments (#82). Chip filters + search combine;
 * every tag maps to a documented rule (`SEGMENT_RULES`), no opaque scoring.
 */
export default async function AdminEmpresas({ searchParams }: { searchParams: Promise<SP> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const sp = await searchParams;
  const q = one(sp.q)?.trim() ?? "";
  const seg = one(sp.seg) as SegmentTag | undefined;

  const all = await listCompanySegments();
  let rows = all;
  if (q) {
    const ql = q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.name.toLowerCase().includes(ql) ||
        (c.nif ?? "").toLowerCase().includes(ql) ||
        (c.email ?? "").toLowerCase().includes(ql),
    );
  }
  if (seg && seg in SEGMENT_LABEL) rows = rows.filter((c) => c.tags.includes(seg));

  // Only show chips for segments that actually have companies right now.
  const counts = new Map<SegmentTag, number>();
  for (const c of all) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const chips = (Object.keys(SEGMENT_LABEL) as SegmentTag[]).filter(
    (t) => (counts.get(t) ?? 0) > 0,
  );

  const qp = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, seg, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "/admin/empresas";
  };

  // The current filter state, threaded to the detail page so "← Empresas"
  // returns here with search + segment intact (#81).
  const listQuery = (() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (seg) p.set("seg", seg);
    return p.toString();
  })();
  const rowHref = (id: string) =>
    `/admin/empresas/${id}${listQuery ? `?from=${encodeURIComponent(listQuery)}` : ""}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Empresas"
        lead="Cuentas de empresa, su uso real y su segmento automático."
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">
            Buscar por nombre, NIF o email
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            data-testid="empresa-search"
            className="mt-1 w-72 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </label>
        {seg && <input type="hidden" name="seg" value={seg} />}
        <button
          type="submit"
          className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
        >
          Buscar
        </button>
        {(q || seg) && (
          <Link href="/admin/empresas" className="text-sm" data-testid="empresa-clear">
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="flex flex-wrap gap-1.5" data-testid="segment-chips">
        {chips.map((t) => {
          const active = seg === t;
          return (
            <Link
              key={t}
              href={qp({ seg: active ? undefined : t })}
              title={SEGMENT_RULES[t]}
              aria-pressed={active}
              className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs no-underline ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {SEGMENT_LABEL[t]} <span className="tabular-nums">{counts.get(t)}</span>
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-[var(--color-text-muted)]" role="status">
        {rows.length} empresa{rows.length === 1 ? "" : "s"}
        {seg ? ` · ${SEGMENT_LABEL[seg]}` : ""}
      </p>

      {rows.length === 0 ? (
        <Empty>Ninguna empresa con estos filtros.</Empty>
      ) : (
        <Table
          head={["Empresa", "NIF", "Alta", "Miembros", "DeCA 7d/30d/tot", "Último", "Segmentos"]}
        >
          {rows.slice(0, 300).map((c) => (
            <Row key={c.id}>
              <Cell>
                <Link
                  href={rowHref(c.id)}
                  className="font-medium no-underline"
                  data-testid="empresa-row-link"
                >
                  {c.name}
                </Link>
              </Cell>
              <Cell mono>{c.nif ?? "—"}</Cell>
              <Cell mono>{fmt(c.createdAt)}</Cell>
              <Cell>{c.members}</Cell>
              <Cell mono>{`${c.d7}/${c.d30}/${c.total}`}</Cell>
              <Cell mono>{fmt(c.lastDecaAt)}</Cell>
              <Cell>
                <span className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} tone="muted">
                      {SEGMENT_LABEL[t]}
                    </Badge>
                  ))}
                  {c.tags.length > 3 && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      +{c.tags.length - 3}
                    </span>
                  )}
                </span>
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
