"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { SUPPORT_CATEGORIES } from "@/lib/support/schema";

/** "Abrir una incidencia técnica" (#86 part 5). Creates a tracked ticket. */
export function SupportTicketForm() {
  const t = useT();
  const s = t.panel.help;
  const router = useRouter();
  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, subject, body }),
      });
      if (!res.ok) {
        setError(s.category ? "Revisa el asunto y la descripción." : "Error");
        setBusy(false);
        return;
      }
      setDone(true);
      setSubject("");
      setBody("");
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <p data-testid="support-ticket-sent" className="text-sm text-[var(--color-success)]">
        {s.sent}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3" noValidate>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <label className="block text-sm">
        <span className="font-medium">{s.category}</span>
        <select
          data-testid="ticket-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
        >
          {SUPPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {s.categories[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">{s.subject}</span>
        <input
          data-testid="ticket-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={160}
          className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">{s.message}</span>
        <textarea
          data-testid="ticket-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          className="mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        data-testid="ticket-submit"
        disabled={busy}
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
      >
        {busy ? s.sending : s.send}
      </button>
    </form>
  );
}
