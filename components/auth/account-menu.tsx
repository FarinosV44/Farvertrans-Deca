"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandGlyph } from "@/components/brand/wordmark";

/**
 * Authenticated header control (ACCOUNT #23): company name → account menu with
 * `Mi panel`, `Mis datos` and `Cerrar sesión`. Native <details> so it works
 * without extra JS wiring and closes on outside interaction via the browser.
 */
export function AccountMenu({ companyName }: { companyName: string }) {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/");
    router.refresh();
  }

  async function logoutAll() {
    try {
      await fetch("/api/auth/logout-all", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.refresh();
  }

  return (
    <details className="relative" data-testid="account-menu">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 text-sm font-medium">
        <BrandGlyph size={18} />
        <span className="max-w-[10rem] truncate">{companyName}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-52 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-[0_8px_24px_rgba(15,23,32,0.12)]">
        <Link
          href="/panel"
          className="block rounded-[6px] px-3 py-2 text-sm no-underline hover:bg-[var(--color-surface)]"
        >
          Mi panel
        </Link>
        <Link
          href="/panel/datos"
          className="block rounded-[6px] px-3 py-2 text-sm no-underline hover:bg-[var(--color-surface)]"
        >
          Mis datos
        </Link>
        <Link
          href="/panel/equipo"
          className="block rounded-[6px] px-3 py-2 text-sm no-underline hover:bg-[var(--color-surface)]"
        >
          Equipo
        </Link>
        <button
          type="button"
          onClick={logoutAll}
          data-testid="logout-all"
          className="mt-1 block w-full rounded-[6px] px-3 py-2 text-left text-sm hover:bg-[var(--color-surface)]"
        >
          Cerrar sesión en todos los dispositivos
        </button>
        <button
          type="button"
          onClick={logout}
          data-testid="logout"
          className="block w-full rounded-[6px] px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface)]"
        >
          Cerrar sesión
        </button>
      </div>
    </details>
  );
}
