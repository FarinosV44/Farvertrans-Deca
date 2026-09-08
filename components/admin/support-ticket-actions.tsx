"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORT_STATUSES, SUPPORT_STATUS_LABEL, type SupportStatus } from "@/lib/support/schema";

/** Superadmin reply + status change on a support ticket (#86 part 5). */
export function SupportTicketActions({
  ticketId,
  status,
}: {
  ticketId: string;
  status: SupportStatus;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [nextStatus, setNextStatus] = useState<SupportStatus>(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(payload: { body?: string; status?: SupportStatus }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("No se pudo guardar.");
        setBusy(false);
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Estado</span>
          <select
            data-testid="ticket-status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as SupportStatus)}
            className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          >
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {SUPPORT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          data-testid="ticket-status-save"
          disabled={busy || nextStatus === status}
          onClick={() => patch({ status: nextStatus })}
          className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 font-medium disabled:opacity-55"
        >
          Cambiar estado
        </button>
      </div>

      <div>
        <label htmlFor="admin-reply" className="block text-sm font-medium">
          Responder al usuario
        </label>
        <textarea
          id="admin-reply"
          data-testid="ticket-admin-reply"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={5000}
          className="mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-2 text-sm"
        />
        <button
          type="button"
          data-testid="ticket-admin-reply-send"
          disabled={busy || !body.trim()}
          onClick={() => patch({ body })}
          className="mt-2 min-h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          Enviar respuesta
        </button>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Al responder, la incidencia pasa a &laquo;Pendiente de usuario&raquo; y el usuario recibe
          un correo.
        </p>
      </div>
    </div>
  );
}
