"use client";
import Link from "next/link";
import { track } from "@/lib/analytics/client";
import type { EventName } from "@/lib/analytics/events";

/**
 * Primary "CREAR DECA GRATIS" call to action. Always a real <a href="/crear"> so
 * it works with JS disabled (SSR). Fires `click_crear_deca` plus an optional
 * placement event (`hero_cta`, `header_cta`, `final_cta` — DESIGN #22).
 */
export function CtaButton({
  children,
  variant = "primary",
  className = "",
  href = "/crear",
  event,
  testId = "cta-crear",
}: {
  children: React.ReactNode;
  variant?: "primary" | "inverse";
  className?: string;
  href?: string;
  event?: EventName;
  testId?: string;
}) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] px-6 font-medium no-underline transition-colors";
  const styles =
    variant === "inverse"
      ? "btn-inverse bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)]"
      : "btn-primary bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)]";
  return (
    <Link
      href={href}
      prefetch
      onClick={() => {
        track("click_crear_deca");
        if (event) track(event);
      }}
      className={`${base} ${styles} ${className}`}
      data-testid={testId}
    >
      {children}
    </Link>
  );
}
