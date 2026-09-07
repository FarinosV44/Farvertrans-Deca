import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Sistema Vía (#67) — one button, four tiers. `danger` is a distinct
 * hierarchy for destructive actions (red border, never a filled red button
 * for a routine action) — #65 AC.
 */
type Tier = "primary" | "secondary" | "ghost" | "danger" | "route";

const TIER: Record<Tier, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] border-transparent hover:bg-[var(--color-primary-hover)]",
  route: "bg-[var(--color-route)] text-white border-transparent hover:brightness-95",
  secondary:
    "bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface)]",
  ghost:
    "bg-transparent text-[var(--color-primary)] border-transparent hover:bg-[var(--color-primary-bg)]",
  danger:
    "bg-transparent text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]",
};

export function Button({
  tier = "secondary",
  icon,
  children,
  className = "",
  ...rest
}: {
  tier?: Tier;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-4 text-sm font-semibold tracking-[0.01em] transition-colors disabled:opacity-55 ${TIER[tier]} ${className}`}
    >
      {icon && (
        <span aria-hidden className="flex h-4 w-4 flex-none">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
