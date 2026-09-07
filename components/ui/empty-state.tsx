import type { ReactNode } from "react";

/**
 * Sistema Vía (#67) — the standard empty screen: a line icon, a plain title,
 * one sentence of what will appear here, and an optional action.
 */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
      {icon && (
        <span aria-hidden className="mb-3 flex h-11 w-11 text-[var(--color-text-muted)]">
          {icon}
        </span>
      )}
      <h4 className="text-base font-bold">{title}</h4>
      {children && (
        <p className="max-w-[42ch] text-sm text-[var(--color-text-muted)]">{children}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
