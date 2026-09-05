import Link from "next/link";
import {
  DocumentIcon,
  HistoryIcon,
  CopyIcon,
  BuildingIcon,
  UsersIcon,
} from "@/components/panel/icons";

const TABS = [
  { key: "home", href: "/panel", label: "Mis DeCA", Icon: DocumentIcon },
  { key: "historico", href: "/panel/historico", label: "Historial", Icon: HistoryIcon },
  { key: "plantillas", href: "/panel/plantillas", label: "Plantillas", Icon: CopyIcon },
  { key: "datos", href: "/panel/datos", label: "Datos habituales", Icon: BuildingIcon },
  { key: "equipo", href: "/panel/equipo", label: "Equipo", Icon: UsersIcon },
] as const;

export function AppNav({
  current,
}: {
  current: "home" | "historico" | "datos" | "plantillas" | "equipo";
}) {
  return (
    <nav
      aria-label="Secciones de la cuenta"
      className="mt-4 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-2"
    >
      {TABS.map(({ key, href, label, Icon }) => {
        const active = current === key;
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm no-underline transition-colors ${
              active
                ? "bg-[var(--color-surface)] font-medium text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <Icon width={18} height={18} strokeWidth={active ? 2 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
