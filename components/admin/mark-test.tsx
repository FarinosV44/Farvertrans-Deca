"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * #103 — "Marcar como prueba" / "Quitar marca de prueba". Purely a
 * visibility/metrics toggle: reversible, never touches access, sessions, or
 * data — kept visually simple (a plain button, not a confirm dialog) because
 * it carries none of the risk the status/anonymize actions above it do.
 */
export function MarkTest({ id, isTest }: { id: string; isTest: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/empresas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_test", isTest: !isTest }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      data-testid="mark-test-toggle"
      className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium"
    >
      {isTest ? "Quitar marca de prueba" : "Marcar como prueba"}
    </button>
  );
}
