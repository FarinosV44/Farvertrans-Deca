"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/client";
import {
  CapacityModePicker,
  VehicleTypePicker,
  type CapacityMode,
  type VehicleType,
} from "@/components/deca/capacity-vehicle-picker";

const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  lona: "Lona",
  frigorifico: "Frigorífico",
};

/** "Madrid · 12 sep · Grupaje · 4 m · 8.000 kg · Lona → preferencia Valencia" (#119 §8). */
function summaryLine(v: {
  destination: string;
  availabilityDate: string;
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
  vehicleType: VehicleType | null;
  preferredDestination: string | null;
}): string {
  const parts = [v.destination];
  const d = new Date(v.availabilityDate);
  if (!Number.isNaN(d.getTime())) {
    parts.push(d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
  }
  parts.push(v.capacityMode === "partial" ? "Grupaje" : "Camión completo");
  if (v.capacityMode === "partial" && v.linearMeters) parts.push(`${v.linearMeters} m`);
  if (v.capacityMode === "partial" && v.maxWeightKg) {
    parts.push(`${v.maxWeightKg.toLocaleString("es-ES")} kg`);
  }
  if (v.vehicleType) parts.push(VEHICLE_TYPE_LABEL[v.vehicleType]);
  let line = parts.join(" · ");
  if (v.preferredDestination) line += ` → preferencia ${v.preferredDestination}`;
  return line;
}

/**
 * Shown on a DeCA's detail page when a commercial availability record has been
 * prepared for that porte (#84, expanded #119 with edit + the richer fields).
 * Lets the owner edit or withdraw it at any time. Small, neutral — not an alarm.
 */
export function AvailabilityNotice({
  decaId,
  status,
  destination,
  availabilityDate,
  preferredDestination,
  capacityMode,
  linearMeters,
  maxWeightKg,
  vehicleType,
  canManage,
}: {
  decaId: string;
  status: "pending" | "withdrawn" | "expired";
  destination: string;
  /** ISO date (YYYY-MM-DD). */
  availabilityDate: string;
  preferredDestination: string | null;
  capacityMode: CapacityMode;
  linearMeters: number | null;
  maxWeightKg: number | null;
  vehicleType: VehicleType | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    destination,
    availabilityDate,
    preferredDestination: preferredDestination ?? "",
    capacityMode,
    linearMeters: linearMeters ? String(linearMeters) : "",
    maxWeightKg: maxWeightKg ? String(maxWeightKg) : "",
    vehicleType: vehicleType ?? "",
  });

  useEffect(() => {
    if (status === "expired") track("availability_expired_viewed");
  }, [status]);

  async function withdraw() {
    if (!window.confirm("¿Retirar este porte de las propuestas de carga? No afecta al DeCA."))
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/deca/${decaId}/availability`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      if (!res.ok) {
        setError("No se pudo retirar.");
        setBusy(false);
        return;
      }
      track("availability_cancelled");
      router.refresh();
    } catch {
      setError("Sin conexión.");
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/deca/${decaId}/availability`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "update",
          destination: form.destination,
          availabilityDate: form.availabilityDate,
          preferredDestination: form.preferredDestination || undefined,
          capacityMode: form.capacityMode,
          linearMeters: form.capacityMode === "partial" ? Number(form.linearMeters) : undefined,
          maxWeightKg: form.capacityMode === "partial" ? Number(form.maxWeightKg) : undefined,
          vehicleType: form.vehicleType || undefined,
        }),
      });
      if (!res.ok) {
        setError("No se pudo guardar. Revisa los datos.");
        setBusy(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Sin conexión.");
      setBusy(false);
    }
  }

  if (status !== "pending") {
    return (
      <div
        data-testid="availability-notice"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm"
      >
        <p className="text-[var(--color-text-muted)]">
          {status === "withdrawn"
            ? "Este porte se retiró de las propuestas de carga."
            : "La disponibilidad de este porte ha caducado."}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="availability-notice"
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm"
    >
      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            Este porte está marcado para propuestas de carga —{" "}
            {summaryLine({
              destination,
              availabilityDate,
              capacityMode,
              linearMeters,
              maxWeightKg,
              vehicleType,
              preferredDestination,
            })}
            .
          </p>
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="availability-edit"
                onClick={() => setEditing(true)}
                className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium"
              >
                Editar
              </button>
              <button
                type="button"
                data-testid="availability-withdraw"
                disabled={busy}
                onClick={withdraw}
                className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-danger)]"
              >
                Retirar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium">Zona de disponibilidad</span>
            <input
              data-testid="availability-edit-destination"
              value={form.destination}
              onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium">Fecha de disponibilidad</span>
            <input
              type="date"
              data-testid="availability-edit-date"
              value={form.availabilityDate}
              onChange={(e) => setForm((f) => ({ ...f, availabilityDate: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium">Destino preferente (opcional)</span>
            <input
              data-testid="availability-edit-preferred"
              value={form.preferredDestination}
              onChange={(e) => setForm((f) => ({ ...f, preferredDestination: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <CapacityModePicker
            idPrefix="availability-edit"
            value={form.capacityMode}
            onChange={(m) => setForm((f) => ({ ...f, capacityMode: m }))}
            fullLabel="Camión completo"
            fullHint="El vehículo quedará completamente disponible."
            partialLabel="Grupaje"
            partialHint="Solo tienes parte del espacio disponible."
          />
          {form.capacityMode === "partial" && (
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-medium">Metros lineales</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  data-testid="availability-edit-meters"
                  value={form.linearMeters}
                  onChange={(e) => setForm((f) => ({ ...f, linearMeters: e.target.value }))}
                  className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium">Peso máx. (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  data-testid="availability-edit-weight"
                  value={form.maxWeightKg}
                  onChange={(e) => setForm((f) => ({ ...f, maxWeightKg: e.target.value }))}
                  className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
                />
              </label>
            </div>
          )}
          <VehicleTypePicker
            idPrefix="availability-edit"
            value={form.vehicleType as VehicleType | ""}
            onChange={(v) => setForm((f) => ({ ...f, vehicleType: v }))}
            lonaLabel="Lona"
            frigorificoLabel="Frigorífico"
          />
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="availability-edit-save"
              disabled={busy}
              onClick={save}
              className="min-h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-contrast)]"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
