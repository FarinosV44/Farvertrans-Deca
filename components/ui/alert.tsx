import type { ReactNode } from "react";

/**
 * Sistema Vía (#67) — an inline notice with the "línea" as a left border in
 * the tone's colour. Use for the completa-tus-datos / verify-email banners
 * and validation summaries.
 */
export function Alert({
  tone = "warn",
  children,
  role = "status",
  ...rest
}: {
  tone?: "warn" | "danger" | "primary" | "success";
  children: ReactNode;
  role?: "status" | "alert";
} & { [k: `data-${string}`]: string }) {
  const v = tone;
  return (
    <div
      role={role}
      {...rest}
      className="flex gap-3 rounded-r-[var(--radius-sm)] border-l-[3px] p-3.5 text-sm"
      style={{
        borderColor: `var(--color-${v})`,
        background: `var(--color-${v}-bg)`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="mt-px h-[17px] w-[17px] flex-none"
        style={{ color: `var(--color-${v})` }}
      >
        {tone === "danger" ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16h.01" />
          </>
        ) : (
          <>
            <path d="M12 3 22 20H2z" />
            <path d="M12 9v5M12 17h.01" />
          </>
        )}
      </svg>
      <div>{children}</div>
    </div>
  );
}
