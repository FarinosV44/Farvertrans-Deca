"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sections of the admin command center (ADMIN #33 §"Route / shell"). */
export const ADMIN_SECTIONS: { href: string; label: string }[] = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/deca", label: "DeCA" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/captacion", label: "Captación" },
  { href: "/admin/operadores", label: "Operadores" },
  { href: "/admin/contenido", label: "Contenido" },
  { href: "/admin/errores", label: "Errores" },
  { href: "/admin/sistema", label: "Sistema" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <ul className="flex flex-col gap-0.5">
      {ADMIN_SECTIONS.map((s) => {
        const active = isActive(pathname, s.href);
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`block rounded-[var(--radius-sm)] px-3 py-2 text-sm no-underline ${
                active
                  ? "bg-[var(--color-primary)] font-medium text-[var(--color-primary-contrast)]"
                  : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              }`}
            >
              {s.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:hidden">
        <Link href="/admin" className="font-bold no-underline text-[var(--color-text)]">
          DeCA · Admin
        </Link>
        <button
          type="button"
          data-testid="admin-nav-toggle"
          aria-expanded={open}
          aria-controls="admin-nav-drawer"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>
      {open && (
        <nav
          id="admin-nav-drawer"
          aria-label="Secciones de administración"
          className="border-b border-[var(--color-border)] bg-[var(--color-bg)] p-3 md:hidden"
        >
          {links}
        </nav>
      )}

      {/* Desktop sidebar */}
      <nav
        aria-label="Secciones de administración"
        className="hidden w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] p-3 md:flex"
      >
        <Link
          href="/admin"
          className="mb-3 px-3 text-sm font-bold no-underline text-[var(--color-text)]"
        >
          DeCA · Admin
        </Link>
        {links}
        <p className="mt-auto px-3 pt-4 text-xs text-[var(--color-text-muted)] break-all">
          {email}
        </p>
      </nav>
    </>
  );
}
