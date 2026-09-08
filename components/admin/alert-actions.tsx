"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Mark a commercial alert reviewed or dismissed (#90). */
export function AlertActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(status: "reviewed" | "dismissed") {
    setBusy(true);
    try {
      await fetch(`/api/admin/alertas-comerciales/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-1.5 text-xs">
      <button
        type="button"
        data-testid={`alert-review-${id}`}
        disabled={busy}
        onClick={() => set("reviewed")}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 disabled:opacity-55"
      >
        Revisada
      </button>
      <button
        type="button"
        data-testid={`alert-dismiss-${id}`}
        disabled={busy}
        onClick={() => set("dismissed")}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 disabled:opacity-55"
      >
        Descartar
      </button>
    </div>
  );
}
