import Link from "next/link";

export function AppNav({
  current,
}: {
  current: "home" | "historico" | "datos" | "plantillas" | "equipo";
}) {
  const item = (href: string, label: string, key: string) => (
    <Link
      href={href}
      aria-current={current === key ? "page" : undefined}
      className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm no-underline ${
        current === key
          ? "bg-[var(--color-surface)] font-medium text-[var(--color-text)]"
          : "text-[var(--color-text-muted)]"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <nav
      aria-label="Secciones de la cuenta"
      className="mt-4 flex gap-1 border-b border-[var(--color-border)] pb-2"
    >
      {item("/panel", "Mis DeCA", "home")}
      {item("/panel/historico", "Historial", "historico")}
      {item("/panel/plantillas", "Plantillas", "plantillas")}
      {item("/panel/datos", "Datos habituales", "datos")}
      {item("/panel/equipo", "Equipo", "equipo")}
    </nav>
  );
}
