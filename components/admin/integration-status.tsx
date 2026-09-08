"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTEGRATION_STATUSES } from "@/lib/integrations/constants";

const LABEL: Record<string, string> = {
  new: "Nueva",
  reviewed: "Revisada",
  contact: "Contactar",
  discarded: "Descartada",
};

/** #74 — internal triage of an integration request. */
export function IntegrationStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setValue(next);
    setBusy(true);
    try {
      const res = await fetch("/api/integraciones", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) router.refresh();
      else setValue(status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      data-testid="integration-status"
      className="min-h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 text-xs"
    >
      {INTEGRATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABEL[s]}
        </option>
      ))}
    </select>
  );
}
