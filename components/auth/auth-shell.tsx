import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Focused auth surface (AUTH #30): one centered card on a calm branded ground,
 * no site navigation. Used by `/entrar` and `/registro`.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-ground flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="no-underline" aria-label="DeCA Fácil — inicio">
        <Wordmark size={30} />
      </Link>
      <main
        id="contenido"
        className="mt-6 w-full max-w-[420px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(15,23,32,0.04),0_12px_32px_-12px_rgba(15,23,32,0.12)] sm:p-8"
      >
        {children}
      </main>
    </div>
  );
}
