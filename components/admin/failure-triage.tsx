"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Triage a generation failure (ADMIN #33 §7): add an internal note, toggle
 * resolved. It never edits the failure record itself — only the operational
 * annotations on it.
 */
export function FailureTriage({
  correlationId,
  initialNote,
  initialResolved,
}: {
  correlationId: string;
  initialNote: string;
  initialResolved: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [resolved, setResolved] = useState(initialResolved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save(patch: { note?: string; resolved?: boolean }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/failures/${correlationId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setError("No se ha podido guardar.");
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError("Sin conexión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <h2 className="text-sm font-bold">Triaje interno</h2>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          data-testid="failure-resolved"
          checked={resolved}
          onChange={(e) => {
            setResolved(e.target.checked);
            void save({ resolved: e.target.checked });
          }}
        />
        Marcado como resuelto
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-xs text-[var(--color-text-muted)]">Nota</span>
        <textarea
          value={note}
          data-testid="failure-note"
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={1000}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm"
          placeholder="Qué se ha comprobado, con quién, siguiente paso…"
        />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          data-testid="failure-save-note"
          onClick={() => void save({ note })}
          disabled={saving}
          className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {saving ? "Guardando…" : "Guardar nota"}
        </button>
        {savedAt && !error && <span className="text-xs text-[var(--color-success)]">Guardado</span>}
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    </div>
  );
}
