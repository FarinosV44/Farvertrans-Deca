import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared presentation primitives for the admin command center (ADMIN #33 §11):
 * compact information density, real tables, useful empty states. No charts.
 */

export function PageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b-2 border-[var(--color-text)] pb-3">
      <div>
        <p
          aria-hidden
          className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
        >
          <span className="h-[3px] w-6 bg-[var(--color-primary)]" />
          Superadministración
        </p>
        <h1 className="text-xl font-bold">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</div>}
    </div>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

// Sistema Vía (#67): the pill style — a tint + a hairline border in the
// functional colour, not a soft rounded pill. `Badge` keeps its tone API.
const STATE_STYLE: Record<string, string> = {
  ok: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_28%,transparent)]",
  green:
    "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_28%,transparent)]",
  warn: "bg-[var(--color-warn-bg)] text-[var(--color-warn)] border-[color-mix(in_srgb,var(--color-warn)_28%,transparent)]",
  yellow:
    "bg-[var(--color-warn-bg)] text-[var(--color-warn)] border-[color-mix(in_srgb,var(--color-warn)_28%,transparent)]",
  fail: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)]",
  red: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)]",
  muted:
    "bg-[var(--color-rest-bg)] text-[var(--color-rest)] border-[color-mix(in_srgb,var(--color-rest)_24%,transparent)]",
};

export function Badge({ tone = "muted", children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-semibold ${
        STATE_STYLE[tone] ?? STATE_STYLE.muted
      }`}
    >
      {children}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--color-text)] bg-[var(--color-surface)] text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            {head.map((h) => (
              <th key={h} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <tr className="border-b border-[var(--color-border-soft)] last:border-0">{children}</tr>;
}

export function Cell({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return <td className={`px-3 py-2 align-top ${mono ? "font-mono text-xs" : ""}`}>{children}</td>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-muted)]">
      {children}
    </div>
  );
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col border-b border-[var(--color-border)] py-1.5">
          <dt className="text-xs text-[var(--color-text-muted)]">{it.label}</dt>
          <dd className="mt-0.5 break-words text-sm">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm no-underline hover:underline">
      ← {children}
    </Link>
  );
}
