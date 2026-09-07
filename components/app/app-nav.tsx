import Link from "next/link";
import {
  DocumentIcon,
  HistoryIcon,
  CopyIcon,
  BuildingIcon,
  UsersIcon,
  GearIcon,
  LifebuoyIcon,
} from "@/components/panel/icons";
import { getDictionary } from "@/lib/i18n/server";

const TAB_KEYS = [
  "home",
  "historico",
  "plantillas",
  "datos",
  "equipo",
  "empresa",
  "ayuda",
] as const;
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
  ayuda: { href: "/panel/ayuda", Icon: LifebuoyIcon },
};

export async function AppNav({
  current,
}: {
  current: "home" | "historico" | "datos" | "plantillas" | "equipo" | "empresa" | "ayuda";
}) {
  const t = await getDictionary();
  const TABS = TAB_KEYS.map((key) => ({ key, ...TAB_META[key], label: t.panel.nav[key] }));
  return (
    <nav
      aria-label="Secciones de la cuenta"
      className="mt-4 flex gap-1 overflow-x-auto border-b-2 border-[var(--color-text)]"
    >
      {TABS.map(({ key, href, label, Icon }) => {
        const active = current === key;
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-0.5 flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm no-underline transition-colors ${
              active
                ? "border-[var(--color-primary)] font-semibold text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
