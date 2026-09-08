"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

/** A user reply on their own support ticket (#86 part 5). */
export function SupportTicketReply({ ticketId }: { ticketId: string }) {
  const t = useT();
  const s = t.panel.help;
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        setError("No se pudo enviar. Inténtalo de nuevo.");
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
    <form onSubmit={submit} className="mt-4 space-y-2" noValidate>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium" htmlFor="ticket-reply">
        {s.replyLabel}
      </label>
      <textarea
        id="ticket-reply"
        data-testid="ticket-reply-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder={s.replyPlaceholder}
        className="block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-2 text-sm"
      />
      <button
        type="submit"
        data-testid="ticket-reply-submit"
        disabled={busy}
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        {s.replySend}
      </button>
    </form>
  );
}
