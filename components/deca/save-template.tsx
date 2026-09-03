"use client";
import { useState } from "react";

type Data = {
  shipper?: { name?: string; nif?: string; address?: string };
  carrier?: { name?: string; nif?: string; address?: string };
  origin?: string;
  destination?: string;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
};

/**
 * "Guardar como plantilla" (UX #25) — saves the recurring, non-date data of a
 * generated DeCA as a reusable template. The transport date and the public token
 * are never carried into a template.
 */
export function SaveTemplate({ data }: { data: Data }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(
    data.origin && data.destination ? `${data.origin} → ${data.destination}` : "",
  );
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
          origin: data.origin ?? "",
          destination: data.destination ?? "",
          goods: data.goods ?? "",
          weight: data.weight ?? "",
          tractorPlate: data.tractorPlate ?? "",
          trailerPlate: data.trailerPlate ?? "",
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
