import type { ReactNode } from "react";

/**
 * Sistema Vía (#67) — the signature "línea": an uppercase eyebrow preceded by
 * a short bar in the context's line colour. Sits above section and screen
 * headers. `line` picks which meaning the bar carries.
 */
export function Kicker({
  children,
  line = "primary",
  as: Tag = "p",
}: {
  children: ReactNode;
  line?: "primary" | "route" | "success" | "warn" | "danger" | "rest";
  as?: "p" | "h2" | "div" | "span";
}) {
  const color = `var(--color-${line === "primary" ? "primary" : line})`;
  return (
    <Tag className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
      <span aria-hidden className="h-[3px] w-7 flex-none" style={{ background: color }} />
      {children}
    </Tag>
  );
}
