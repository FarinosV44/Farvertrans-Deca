import { TruckIcon, BoxIcon, TarpIcon, SnowflakeIcon, MoreIcon } from "@/components/panel/icons";
import type { CapacityMode, VehicleType } from "@/lib/commercial/types";

export type { CapacityMode, VehicleType };

/**
 * #119 — "Camión completo" / "Grupaje" as an accessible card-based radio
 * group (issue: "no un select genérico si rompe la claridad visual"), shared
 * by the wizard (creation) and `AvailabilityNotice` (edit) so the visual
 * language never drifts between the two.
 */
export function CapacityModePicker({
  value,
  onChange,
  fullLabel,
  fullHint,
  partialLabel,
  partialHint,
  idPrefix,
}: {
  value: CapacityMode;
  onChange: (v: CapacityMode) => void;
  fullLabel: string;
  fullHint: string;
  partialLabel: string;
  partialHint: string;
  idPrefix: string;
}) {
  const options: { mode: CapacityMode; label: string; hint: string; Icon: typeof TruckIcon }[] = [
    { mode: "full", label: fullLabel, hint: fullHint, Icon: TruckIcon },
    { mode: "partial", label: partialLabel, hint: partialHint, Icon: BoxIcon },
  ];
  return (
    <div role="radiogroup" aria-label={fullLabel} className="grid gap-2 sm:grid-cols-2">
      {options.map(({ mode, label, hint, Icon }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          data-testid={`${idPrefix}-capacity-${mode}`}
          onClick={() => onChange(mode)}
          className={`flex min-h-[64px] items-start gap-2.5 rounded-[var(--radius-md)] border p-3 text-left ${
            value === mode
              ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <Icon
            className={
              value === mode ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
            }
          />
          <span>
            <span className="block text-sm font-medium">{label}</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

const VEHICLE_TYPE_ICON: Record<VehicleType, typeof TarpIcon> = {
  lona: TarpIcon,
  frigorifico: SnowflakeIcon,
  // 2026 correction to #119: reusing the closest existing glyph rather than
  // drawing 3 new bespoke icons for edge-case types — "no complicar
  // innecesariamente la UX" (the issue's own words); the label carries the
  // distinction, the icon just signals "a vehicle/cold variant."
  megatrailer: TruckIcon,
  jumbo: TruckIcon,
  frigolona: SnowflakeIcon,
  otro: MoreIcon,
};

/**
 * #119, expanded by a 2026 correction — "LONA"/"FRIGORÍFICO"/"MEGATRAILER"/
 * "JUMBO"/"FRIGOLONA"/"OTRO", optional (no default forced), same accessible
 * card pattern. `labels` keeps the type list "técnicamente ampliable a más
 * tipos sin una refactorización grande" (the correction's own words) — a
 * future type is one more map entry, not a new prop. `otro` optionally shows
 * a short free-text field via `otherValue`/`onOtherChange`.
 */
export function VehicleTypePicker({
  value,
  onChange,
  labels,
  idPrefix,
  otherValue,
  onOtherChange,
  otherPlaceholder,
}: {
  value: VehicleType | "";
  onChange: (v: VehicleType | "") => void;
  labels: Record<VehicleType, string>;
  idPrefix: string;
  /** Required together with `onOtherChange` to show the "otro" specify field. */
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  otherPlaceholder?: string;
}) {
  const types: VehicleType[] = ["lona", "frigorifico", "megatrailer", "jumbo", "frigolona", "otro"];
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={labels.lona}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {types.map((type) => {
          const Icon = VEHICLE_TYPE_ICON[type];
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={value === type}
              data-testid={`${idPrefix}-type-${type}`}
              onClick={() => onChange(value === type ? "" : type)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 text-sm font-medium ${
                value === type
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)]"
              }`}
            >
              <Icon />
              {labels[type]}
            </button>
          );
        })}
      </div>
      {value === "otro" && onOtherChange && (
        <input
          data-testid={`${idPrefix}-type-other-input`}
          value={otherValue ?? ""}
          placeholder={otherPlaceholder}
          maxLength={60}
          onChange={(e) => onOtherChange(e.target.value)}
          className="mt-2 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
        />
      )}
    </div>
  );
}
