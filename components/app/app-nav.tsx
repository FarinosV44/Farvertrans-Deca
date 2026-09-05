import Link from "next/link";
import {
  DocumentIcon,
  HistoryIcon,
  CopyIcon,
  BuildingIcon,
  UsersIcon,
  GearIcon,
} from "@/components/panel/icons";
import { getDictionary } from "@/lib/i18n/server";

const TAB_KEYS = ["home", "historico", "plantillas", "datos", "equipo", "empresa"] as const;
const TAB_META: Record<
  (typeof TAB_KEYS)[number],
  {
    href: string;
    Icon: (props: { width?: number; height?: number; strokeWidth?: number }) => React.JSX.Element;
  }
> = {
  home: { href: "/panel", Icon: DocumentIcon },
  historico: { href: "/panel/historico", Icon: HistoryIcon },
  plantillas: { href: "/panel/plantillas", Icon: CopyIcon },
  datos: { href: "/panel/datos", Icon: BuildingIcon },
  equipo: { href: "/panel/equipo", Icon: UsersIcon },
  empresa: { href: "/panel/empresa", Icon: GearIcon },
};

export async function AppNav({
  current,
}: {
  current: "home" | "historico" | "datos" | "plantillas" | "equipo" | "empresa";
}) {
  const t = await getDictionary();
  const TABS = TAB_KEYS.map((key) => ({ key, ...TAB_META[key], label: t.panel.nav[key] }));
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
