"use client";
import { useState } from "react";
import { formatLocationShort, type TransportLocation } from "@/lib/deca/location";

type Data = {
  shipper?: { name?: string; nif?: string; address?: string };
  carrier?: { name?: string; nif?: string; address?: string };
  loadLocation?: Partial<TransportLocation>;
  unloadLocation?: Partial<TransportLocation>;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
  /** #113 §5 — shipments BEYOND the first, so a multi-envío DeCA can be saved
   *  as a whole recurring lane. Passed through verbatim (already validated
   *  when this DeCA was generated). */
  shipments?: unknown[];
};

/**
 * "Guardar como plantilla" (UX #25) — saves the recurring, non-date data of a
 * generated DeCA as a reusable template. The transport dates and the public
 * token are never carried into a template.
 */
export function SaveTemplate({ data }: { data: Data }) {
  const [open, setOpen] = useState(false);
  const loadShort = formatLocationShort(data.loadLocation);
  const unloadShort = formatLocationShort(data.unloadLocation);
  const [name, setName] = useState(loadShort && unloadShort ? `${loadShort} → ${unloadShort}` : "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    if (state === "saving" || name.trim().length < 2) return;
    setState("saving");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shipper: data.shipper ?? {},
          carrier: data.carrier ?? {},
          loadLocation: data.loadLocation ?? {},
          unloadLocation: data.unloadLocation ?? {},
          goods: data.goods ?? "",
          weight: data.weight ?? "",
          tractorPlate: data.tractorPlate ?? "",
          trailerPlate: data.trailerPlate ?? "",
          // "Guardar como plantilla" never carries a transport date (see the
          // doc comment above) — strip loadDate/unloadDate from every extra
          // envío the same way the flat fields above never include one.
          ...(data.shipments && data.shipments.length > 1
            ? {
                shipments: data.shipments.slice(1).map((s) => {
                  if (!s || typeof s !== "object") return s;
                  const rest = { ...(s as Record<string, unknown>) };
                  delete rest.loadDate;
                  delete rest.unloadDate;
                  return rest;
                }),
              }
            : {}),
        }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <p className="text-sm text-[var(--color-success)]" data-testid="template-saved">
        Plantilla guardada. La verás al crear el próximo DeCA.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        data-testid="save-template-open"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
      >
        Guardar como plantilla
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-sm">
        <span className="block font-medium">Nombre de la plantilla</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="template-name"
          className="mt-1 min-h-11 w-[16rem] max-w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
        />
      </label>
      <button
        type="button"
        data-testid="save-template-confirm"
        disabled={state === "saving"}
        onClick={save}
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        {state === "saving" ? "Guardando…" : "Guardar plantilla"}
      </button>
      {state === "error" && (
        <span className="text-sm text-[var(--color-danger)]">No se pudo guardar.</span>
      )}
    </div>
  );
}
