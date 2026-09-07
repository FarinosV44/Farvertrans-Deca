import type { ReactNode } from "react";

/**
 * Sistema Vía (#67) — status shown as a geometric glyph **plus text**, never
 * colour alone (#65 AC). The same pill is used in tables, detail sheets and
 * the PDF. `tone` maps to a functional line colour.
 */
export type PillTone = "ok" | "warn" | "stop" | "rest" | "primary";

const GLYPH: Record<PillTone, ReactNode> = {
  ok: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M6.5 11 3 7.5l1-1 2.5 2.5L12 3.5l1 1z" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2 15 14H1z" />
      <path d="M7 6h2v4H7zM7 11h2v2H7z" fill="var(--color-warn-bg)" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM4 7h8v2H4z" />
    </svg>
  ),
  rest: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 7h12v2H2z" />
    </svg>
  ),
  primary: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="8" cy="8" r="4" />
    </svg>
  ),
};

const VAR: Record<PillTone, string> = {
  ok: "success",
  warn: "warn",
  stop: "danger",
  rest: "rest",
  primary: "primary",
};

export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const v = VAR[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-semibold"
      style={{
        color: `var(--color-${v})`,
        background: `var(--color-${v}-bg)`,
        borderColor: `color-mix(in srgb, var(--color-${v}) 28%, transparent)`,
      }}
    >
      <span aria-hidden className="flex h-3 w-3 flex-none">
        {GLYPH[tone]}
      </span>
      {children}
    </span>
  );
}
