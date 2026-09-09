"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandGlyph } from "@/components/brand/wordmark";

type Membership = { companyId: string; companyName: string; role: string };

/**
 * Authenticated header control (ACCOUNT #23): company name → account menu with
 * `Mi panel`, `Mis datos` and `Cerrar sesión`. Native <details> so it works
 * without extra JS wiring and closes on outside interaction via the browser.
 *
 * #102 — "Tus empresas" switcher: fetched lazily (not threaded through every
 * `<SiteHeader>` call site, which would touch dozens of pages for a feature
 * only a minority of accounts ever use) and rendered ONLY when a second
 * membership actually exists, so a single-company account — still the
 * overwhelming majority — sees no change at all.
 */
export function AccountMenu({ companyName }: { companyName: string }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Membership[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/team/companies")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { active: string; companies: Membership[] } | null) => {
        if (!cancelled && data) {
          setCompanies(data.companies);
          setActive(data.active);
        }
      })
      .catch(() => {
        /* the switcher is a convenience, never required — a failed fetch just hides it */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function switchTo(companyId: string) {
    if (switching || companyId === active) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/team/companies", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        router.push("/panel");
        router.refresh();
      }
    } finally {
      setSwitching(false);
    }
  }

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
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 text-sm font-medium">
        <BrandGlyph size={18} />
        {/* the name is dropped on a narrow phone so the authed header never
            overflows (#70); the glyph + menu are enough to find it */}
        <span className="hidden max-w-[10rem] truncate min-[460px]:inline">{companyName}</span>
        <span className="sr-only">{companyName}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-52 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-[0_8px_24px_rgba(15,23,32,0.12)]">
        {companies.length > 1 && (
          <div
            className="mb-1 border-b border-[var(--color-border)] pb-1"
            data-testid="company-switcher"
          >
            <p className="px-3 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
              Tus empresas
            </p>
            {companies.map((c) => (
              <button
                key={c.companyId}
                type="button"
                disabled={switching}
                onClick={() => switchTo(c.companyId)}
                data-testid={`switch-company-${c.companyId}`}
                aria-current={c.companyId === active ? "true" : undefined}
                className={`block w-full truncate rounded-[6px] px-3 py-2 text-left text-sm ${
                  c.companyId === active
                    ? "font-semibold text-[var(--color-primary)]"
                    : "hover:bg-[var(--color-surface)]"
                }`}
              >
                {c.companyName}
              </button>
            ))}
          </div>
        )}
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
        <Link
          href="/panel/ayuda"
          className="block rounded-[6px] px-3 py-2 text-sm no-underline hover:bg-[var(--color-surface)]"
        >
          Ayuda y soporte
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
