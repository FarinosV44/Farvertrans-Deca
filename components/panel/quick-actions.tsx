"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MAX_QUICK_ACTIONS,
  QUICK_ACTIONS,
  resolveQuickActions,
  type QuickActionKey,
} from "@/lib/panel/quick-actions";
import {
  PlusIcon,
  HistoryIcon,
  CopyIcon,
  BuildingIcon,
  TruckIcon,
  MapPinIcon,
  UsersIcon,
  GearIcon,
  LifebuoyIcon,
  IconBadge,
} from "@/components/panel/icons";

type IconCmp = (props: { width?: number; height?: number }) => React.JSX.Element;

const ICONS: Record<string, IconCmp> = {
  plus: PlusIcon,
  history: HistoryIcon,
  copy: CopyIcon,
  building: BuildingIcon,
  truck: TruckIcon,
  mapPin: MapPinIcon,
  users: UsersIcon,
  gear: GearIcon,
  lifebuoy: LifebuoyIcon,
};

/**
 * #93 — "Accesos rápidos" on Inicio: up to three shortcuts to functions that
 * already exist, chosen by this user.
 *
 * Deliberately NOT a widget builder — the issue rules out drag & drop, colours,
 * sizes and layouts. It is a list of checkboxes behind a "Personalizar" link
 * inside the block itself, which is why it adds no new section to the panel.
 * The visual language is the dashboard's existing one: the same icons, the same
 * card shape and the same tokens as the "Nuevo DeCA" / "Duplicar" actions above
 * it, so the block reads as part of the screen rather than as a new module.
 */
export function QuickActions({
  initial,
  labels,
  t,
}: {
  initial: string[];
  labels: Record<QuickActionKey, string>;
  t: {
    title: string;
    customise: string;
    save: string;
    cancel: string;
    restore: string;
    /** Already resolved server-side — a function cannot cross the RSC boundary. */
    hint: string;
    limit: string;
  };
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string[]>(initial);
  const [draft, setDraft] = useState<string[]>(initial);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const shown = resolveQuickActions(chosen);
  const atLimit = draft.length >= MAX_QUICK_ACTIONS;

  function toggle(key: QuickActionKey) {
    setDraft((d) => (d.includes(key) ? d.filter((k) => k !== key) : atLimit ? d : [...d, key]));
  }

  async function persist(actions: string[]) {
    setBusy(true);
    const res = await fetch("/api/panel/accesos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions }),
    });
    setBusy(false);
    if (!res.ok) return;
    const body = (await res.json()) as { actions: string[] };
    setChosen(body.actions);
    setDraft(body.actions);
    setEditing(false);
    // The block is server-rendered on Inicio; refresh so a reload (or another
    // tab) shows the same thing this one now shows.
    router.refresh();
  }

  return (
    <section className="mt-8" aria-labelledby="accesos-rapidos" data-testid="quick-actions">
      <div className="flex items-center justify-between gap-3">
        <h2 id="accesos-rapidos" className="text-lg font-bold">
          {t.title}
        </h2>
        <button
          type="button"
          onClick={() => {
            setDraft(chosen);
            setEditing((e) => !e);
          }}
          aria-expanded={editing}
          data-testid="quick-actions-customise"
          className="text-sm font-semibold text-[var(--color-primary)] underline"
        >
          {t.customise}
        </button>
      </div>

      {!editing && (
        <ul className="mt-3 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
          {shown.map((a) => {
            const Icon = ICONS[a.icon];
            return (
              <li key={a.key}>
                <Link
                  href={a.href}
                  data-testid={`quick-action-${a.key}`}
                  className="flex min-h-14 items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] no-underline"
                >
                  <IconBadge size={32}>
                    <Icon width={16} height={16} />
                  </IconBadge>
                  {labels[a.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">{t.hint}</p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 min-[480px]:grid-cols-2">
            {QUICK_ACTIONS.map((a) => {
              const checked = draft.includes(a.key);
              const disabled = !checked && atLimit;
              return (
                <li key={a.key}>
                  <label
                    className={`flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm ${
                      disabled ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(a.key)}
                      data-testid={`quick-action-option-${a.key}`}
                      className="h-4 w-4"
                    />
                    {labels[a.key]}
                  </label>
                </li>
              );
            })}
          </ul>
          {atLimit && (
            <p role="status" className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t.limit}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => persist(draft)}
              data-testid="quick-actions-save"
              className="min-h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)]"
            >
              {t.save}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => persist([])}
              data-testid="quick-actions-restore"
              className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 font-medium"
            >
              {t.restore}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(chosen);
                setEditing(false);
              }}
              className="min-h-11 rounded-[var(--radius-sm)] px-4 font-medium text-[var(--color-text-muted)] underline"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
