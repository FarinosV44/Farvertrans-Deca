"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Best-effort webmail inbox link, by common provider domain — opens the inbox, never a compose window. */
function webmailUrl(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com")
    return "https://mail.google.com/mail/u/0/";
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain))
    return "https://outlook.live.com/mail/0/inbox";
  if (domain === "yahoo.com" || domain === "yahoo.es") return "https://mail.yahoo.com/";
  if (domain === "icloud.com" || domain === "me.com") return "https://www.icloud.com/mail";
  return null;
}

/**
 * The dedicated email-confirmation screen (GROWTH #46) — never a generic auth
 * provider page. Verification is a courtesy, not a hard gate: every action
 * here leaves the user free to continue into the product regardless.
 */
export function VerifyEmailScreen({ email, next }: { email: string; next: string }) {
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState(email);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [changing, setChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeError, setChangeError] = useState<string | null>(null);
  const mail = webmailUrl(currentEmail);

  async function resend() {
    if (resendState === "sending") return;
    setResendState("sending");
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      setResendState(res.ok ? "sent" : "error");
    } catch {
      setResendState("error");
    }
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setChangeError(null);
    try {
      const res = await fetch("/api/auth/verify-email/change-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChangeError(data?.error?.message ?? "No se pudo cambiar el correo.");
        return;
      }
      setCurrentEmail(data.email);
      setChanging(false);
      setResendState("sent");
    } catch {
      setChangeError("Sin conexión. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="text-center">
      <div
        aria-hidden
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-3xl"
      >
        ✉️
      </div>
      <h1 className="mt-5 text-2xl font-bold">Confirma tu correo electrónico</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Ya casi está. Te hemos enviado un correo a{" "}
        <strong className="text-[var(--color-text)]" data-testid="verify-email-address">
          {currentEmail}
        </strong>{" "}
        para activar tu cuenta y empezar a emitir DeCA.
      </p>

      <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left">
        <h2 className="text-sm font-bold">Qué ocurre después</h2>
        <ol className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
          <li>1. Confirmas tu email</li>
          <li>2. Accedes a tu cuenta</li>
          <li>3. Empiezas a emitir DeCA</li>
        </ol>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {mail && (
          <a
            href={mail}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-3 font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            Abrir mi correo
          </a>
        )}
        <button
          type="button"
          data-testid="verify-email-resend"
          onClick={resend}
          disabled={resendState === "sending"}
          className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-3 font-medium disabled:opacity-55"
        >
          {resendState === "sending" ? "Enviando…" : "Reenviar correo"}
        </button>
        {resendState === "sent" && (
          <p role="status" className="text-sm text-[var(--color-success)]">
            Correo reenviado. Revisa tu bandeja de entrada.
          </p>
        )}
        {resendState === "error" && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            No se pudo reenviar. Inténtalo de nuevo en unos minutos.
          </p>
        )}

        {!changing ? (
          <button
            type="button"
            data-testid="verify-email-change-open"
            onClick={() => setChanging(true)}
            className="text-sm font-medium text-[var(--color-primary)] underline"
          >
            Cambiar correo electrónico
          </button>
        ) : (
          <form onSubmit={changeEmail} className="mt-1 flex flex-col gap-2 text-left">
            <label htmlFor="new-email" className="text-sm font-medium">
              Nuevo correo electrónico
            </label>
            <input
              id="new-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
            />
            {changeError && (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {changeError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                data-testid="verify-email-change-submit"
                className="min-h-11 flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)]"
              >
                Guardar y reenviar
              </button>
              <button
                type="button"
                onClick={() => setChanging(false)}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          data-testid="verify-email-continue"
          onClick={() => router.push(next)}
          className="mt-2 text-sm font-medium text-[var(--color-text-muted)] underline"
        >
          Ya he confirmado mi cuenta
        </button>
      </div>

      <p className="mt-6 text-xs text-[var(--color-text-muted)]">
        Si no encuentras el mensaje, revisa tu carpeta de spam o promociones.
      </p>
    </div>
  );
}
