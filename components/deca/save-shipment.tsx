"use client";
import { useState } from "react";

type Props = {
  loadLocationId: string;
  unloadLocationId: string;
  goods?: string;
  weight?: string;
  recipient?: string;
  suggestedName?: string;
};

/**
 * "☆ Guardar como envío habitual" (#113 §11) — saves the current envío's
 * origin/destination/goods/weight/recipient as a reusable "ruta/envío
 * habitual", inline during DeCA creation (never checked by default). Only
 * ever shown once both locations are already `SavedLocation`-backed (issue
 * §12 — a route always references two existing places, never free text).
 */
export function SaveShipment({
  loadLocationId,
  unloadLocationId,
  goods,
  weight,
  recipient,
  suggestedName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(suggestedName);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    if (state === "saving") return;
    setState("saving");
    try {
      const res = await fetch("/api/saved-shipments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          loadLocationId,
          unloadLocationId,
          goods: goods ?? "",
          weight: weight ?? "",
          recipient: recipient ?? "",
        }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <p className="mt-2 text-sm text-[var(--color-success)]" data-testid="shipment-saved">
        Envío habitual guardado.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        data-testid="save-shipment-open"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
      >
        ☆ Guardar como envío habitual
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <label className="text-sm">
        <span className="block font-medium">Nombre (opcional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="save-shipment-name"
          className="mt-1 min-h-11 w-[16rem] max-w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
        />
      </label>
      <button
        type="button"
        data-testid="save-shipment-confirm"
        disabled={state === "saving"}
        onClick={save}
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        {state === "saving" ? "Guardando…" : "Guardar"}
      </button>
      {state === "error" && (
        <span className="text-sm text-[var(--color-danger)]">No se pudo guardar.</span>
      )}
    </div>
  );
}
