import { TruckIcon, BoxIcon, TarpIcon, SnowflakeIcon } from "@/components/panel/icons";

export type CapacityMode = "full" | "partial";
export type VehicleType = "lona" | "frigorifico";

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

/** #119 — "LONA" / "FRIGORÍFICO", optional (no default forced), same
 *  accessible card pattern. Deliberately just these two: "dejar el modelo
 *  técnicamente ampliable a más tipos sin mostrar opciones no solicitadas." */
export function VehicleTypePicker({
  value,
  onChange,
  lonaLabel,
  frigorificoLabel,
  idPrefix,
}: {
  value: VehicleType | "";
  onChange: (v: VehicleType | "") => void;
  lonaLabel: string;
  frigorificoLabel: string;
  idPrefix: string;
}) {
  const options: { type: VehicleType; label: string; Icon: typeof TarpIcon }[] = [
    { type: "lona", label: lonaLabel, Icon: TarpIcon },
    { type: "frigorifico", label: frigorificoLabel, Icon: SnowflakeIcon },
  ];
  return (
    <div role="radiogroup" aria-label={lonaLabel} className="flex gap-2">
      {options.map(({ type, label, Icon }) => (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={value === type}
          data-testid={`${idPrefix}-type-${type}`}
          onClick={() => onChange(value === type ? "" : type)}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 text-sm font-medium ${
            value === type
              ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}
