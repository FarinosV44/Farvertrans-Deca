import { CtaButton } from "./cta-button";
import { HERO } from "@/lib/content/landing";

/**
 * Persistent, non-intrusive bottom CTA — mobile only (< 768). The page reserves
 * bottom padding so it never overlaps the last content; it does not trap focus.
 */
export function MobileCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-[0_-4px_16px_rgba(15,23,32,0.08)] md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <CtaButton className="w-full">{HERO.cta}</CtaButton>
    </div>
  );
}
