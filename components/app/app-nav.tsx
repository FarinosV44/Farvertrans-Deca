import Link from "next/link";
import {
  DocumentIcon,
  HistoryIcon,
  CopyIcon,
  BuildingIcon,
  UsersIcon,
  GearIcon,
  ShieldIcon,
  LifebuoyIcon,
} from "@/components/panel/icons";
import { getDictionary } from "@/lib/i18n/server";

type TabKey =
  | "home"
  | "historico"
  | "plantillas"
  | "datos"
  | "equipo"
  | "empresa"
  | "privacidad"
  | "ayuda";
type IconCmp = (props: {
  width?: number;
  height?: number;
  strokeWidth?: number;
}) => React.JSX.Element;

const TAB_META: Record<TabKey, { href: string; Icon: IconCmp }> = {
  home: { href: "/panel", Icon: DocumentIcon },
  historico: { href: "/panel/historico", Icon: HistoryIcon },
  plantillas: { href: "/panel/plantillas", Icon: CopyIcon },
  datos: { href: "/panel/datos", Icon: BuildingIcon },
  equipo: { href: "/panel/equipo", Icon: UsersIcon },
  empresa: { href: "/panel/empresa", Icon: GearIcon },
  privacidad: { href: "/panel/privacidad", Icon: ShieldIcon },
  ayuda: { href: "/panel/ayuda", Icon: LifebuoyIcon },
};

/**
 * Panel section navigation (#70). Never needs a horizontal scrollbar, at any
 * width, and keeps every section one tap away:
 *  - <768px: a native `<details>` disclosure ("Secciones · <current>") opening a
 *    grouped vertical list. No JS, keyboard-operable, closes on navigation.
 *  - ≥768px: a wrap-safe row of pills grouped daily-work / company / help. It
 *    reflows onto a second line rather than scrolling in the narrow (720px)
 *    panel columns; on a full-width page it stays on one line.
 * The persistent "Crear DeCA" CTA lives in the site header and is unaffected.
 */
const GROUPS: { labelKey: "work" | "company" | "help"; keys: TabKey[] }[] = [
  { labelKey: "work", keys: ["home", "historico", "plantillas", "datos"] },
  { labelKey: "company", keys: ["equipo", "empresa", "privacidad"] },
  { labelKey: "help", keys: ["ayuda"] },
];

const GROUP_LABEL: Record<"work" | "company" | "help", string> = {
  work: "Trabajo diario",
  company: "Administración de empresa",
  help: "Ayuda",
};

export async function AppNav({ current }: { current: TabKey }) {
  const t = await getDictionary();
  const label = (k: TabKey) => t.panel.nav[k];
  const currentLabel = label(current);

  return (
    <div className="mt-4" data-testid="panel-nav">
      {/* ≥768px — wrap-safe pills, no scroll ever */}
      <nav
        aria-label="Secciones de la cuenta"
        className="hidden flex-wrap items-center gap-x-1 gap-y-1.5 border-b-2 border-[var(--color-text)] pb-2 md:flex"
      >
        {GROUPS.map((group, gi) => (
          <div
            key={group.labelKey}
            className={`flex flex-wrap items-center gap-1 ${
              gi > 0 ? "ml-1 border-l border-[var(--color-border)] pl-2" : ""
            }`}
          >
            {group.keys.map((key) => {
              const { href, Icon } = TAB_META[key];
              const active = current === key;
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm no-underline transition-colors ${
                    active
                      ? "bg-[var(--color-primary-bg)] font-semibold text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <Icon width={16} height={16} strokeWidth={active ? 2 : 1.75} />
                  {label(key)}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* <768px — disclosure, no scroll */}
      <details className="group md:hidden">
        <summary
          aria-label={`Secciones — actual: ${currentLabel}`}
          className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-4 w-4 flex-col justify-center gap-[3px]" aria-hidden>
              <span className="h-[2px] w-full bg-current" />
              <span className="h-[2px] w-full bg-current" />
              <span className="h-[2px] w-full bg-current" />
            </span>
            Secciones
            <span className="text-[var(--color-text-muted)]">· {currentLabel}</span>
          </span>
          <span
            aria-hidden
            className="text-[var(--color-text-muted)] transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="mt-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {GROUPS.map((group) => (
            <div
              key={group.labelKey}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <p className="bg-[var(--color-surface)] px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                {GROUP_LABEL[group.labelKey]}
              </p>
              {group.keys.map((key) => {
                const { href, Icon } = TAB_META[key];
                const active = current === key;
                return (
                  <Link
                    key={key}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 border-t border-[var(--color-border-soft)] px-3 py-2.5 text-sm no-underline first:border-t-0 ${
                      active
                        ? "bg-[var(--color-primary-bg)] font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <Icon width={17} height={17} strokeWidth={active ? 2 : 1.75} />
                    {label(key)}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
