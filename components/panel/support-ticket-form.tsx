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
      <p
        data-testid="support-ticket-sent"
        className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] p-3.5 text-sm"
      >
        {s.sent}
      </p>
    );
  }

  const field =
    "mt-1.5 block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm focus-visible:border-[var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-primary)]";

  return (
    <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
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
          className={`${field} min-h-11`}
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
          className={`${field} min-h-11`}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">{s.message}</span>
        <textarea
          data-testid="ticket-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={5000}
          className={`${field} py-2.5 leading-relaxed`}
        />
      </label>
      <button
        type="submit"
        data-testid="ticket-submit"
        disabled={busy}
        className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-primary-contrast)] transition-opacity hover:opacity-95 disabled:opacity-55"
      >
        {busy ? s.sending : s.send}
      </button>
    </form>
  );
}
