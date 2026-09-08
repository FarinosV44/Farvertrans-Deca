"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AlertConfig } from "@/lib/commercial/alert-rules";

/** The small config form for the commercial alert rules (#90 — no visual builder). */
export function AlertConfigForm({
  config,
  corridors,
}: {
  config: AlertConfig;
  corridors: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [f, setF] = useState({
    priorityCorridors: new Set(config.priorityCorridors),
    priorityCountries: config.priorityCountries.join(", "),
    minMovements: String(config.minMovements),
    windowDays: String(config.windowDays),
    staleFollowUpDays: String(config.staleFollowUpDays),
    reactivationDays: String(config.reactivationDays),
  });

  function toggleCorridor(id: string) {
    setF((s) => {
      const next = new Set(s.priorityCorridors);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...s, priorityCorridors: next };
    });
  }

  async function save() {
    setBusy(true);
    setOk(false);
    try {
      const res = await fetch("/api/admin/alertas-comerciales/config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          priorityCorridors: [...f.priorityCorridors],
          priorityCountries: f.priorityCountries
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          minMovements: Number(f.minMovements) || 0,
          windowDays: Number(f.windowDays) || 30,
          staleFollowUpDays: Number(f.staleFollowUpDays) || 10,
          reactivationDays: Number(f.reactivationDays) || 60,
        }),
      });
      if (res.ok) {
        setOk(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const num = (key: keyof typeof f, label: string) => (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <input
        inputMode="numeric"
        value={f[key] as string}
        onChange={(e) => setF((s) => ({ ...s, [key]: e.target.value }))}
        className="min-h-8 w-24 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
      />
    </label>
  );

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
      <p className="text-sm font-bold">Reglas de alertas</p>

      <div>
        <p className="mb-1 text-xs text-[var(--color-text-muted)]">Corredores prioritarios</p>
        <div className="flex flex-wrap gap-2">
          {corridors.map((c) => (
            <label key={c.id} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={f.priorityCorridors.has(c.id)}
                onChange={() => toggleCorridor(c.id)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-0.5 text-xs">
        <span className="text-[var(--color-text-muted)]">Países/zonas prioritarios (coma)</span>
        <input
          value={f.priorityCountries}
          onChange={(e) => setF((s) => ({ ...s, priorityCountries: e.target.value }))}
          placeholder="Benelux, Francia"
          className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-sm"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        {num("minMovements", "Mín. movimientos")}
        {num("windowDays", "Ventana (días)")}
        {num("staleFollowUpDays", "Días sin seguimiento")}
        {num("reactivationDays", "Días de pausa (reactivación)")}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="alert-config-save"
          disabled={busy}
          onClick={save}
          className="min-h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          Guardar reglas
        </button>
        {ok && <span className="text-xs text-[var(--color-success)]">Guardado</span>}
      </div>
    </div>
  );
}
