"use client";
import Link from "next/link";
import { track } from "@/lib/analytics/client";

/**
 * Primary "CREAR DECA GRATIS" call to action. Always a real <a href="/crear"> so
 * it works with JS disabled (SSR); the click is also tracked when JS is on.
 */
export function CtaButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "inverse";
  className?: string;
}) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] px-6 font-medium no-underline transition-colors";
  const styles =
    variant === "inverse"
      ? "bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)]"
      : "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)]";
  return (
    <Link
      href="/crear"
      prefetch
      onClick={() => track("click_crear_deca")}
      className={`${base} ${styles} ${className}`}
      data-testid="cta-crear"
    >
      {children}
    </Link>
  );
}
