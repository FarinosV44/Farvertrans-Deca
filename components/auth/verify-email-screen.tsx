"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

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
 * The dedicated email-confirmation screen (GROWTH #46). The account and
 * session exist regardless of verification, so nothing about SIGNING IN is
 * blocked here — but per D-053, generating a DeCA is a hard gate elsewhere
 * (`POST /api/deca`), and this screen never claims verification on its own:
 * "Ya he confirmado mi cuenta" only asks the server what `emailVerifiedAt`
 * actually says, right now, and only proceeds if it is set.
 */
export function VerifyEmailScreen({
  email,
  next,
  initiallySent = true,
}: {
  email: string;
  next: string;
  /** False when the ORIGINAL signup email failed to send (D-053) — never claim it arrived. */
  initiallySent?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState(email);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [changing, setChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeError, setChangeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [notYetVerified, setNotYetVerified] = useState(false);
  const mail = webmailUrl(currentEmail);

  async function checkAndContinue() {
    if (checking) return;
    setChecking(true);
    setNotYetVerified(false);
    try {
      const res = await fetch("/api/auth/verify-email/status");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.verified) {
        // A page seen signed-out before (e.g. `/crear`'s registration gate)
        // can sit in Next's client router cache with pre-login server data;
        // refresh() forces a fresh render so the newly-verified state shows.
        router.push(next);
        router.refresh();
      } else {
        setNotYetVerified(true);
      }
    } catch {
      // fail closed — never let a network hiccup be read as "verified"
      setNotYetVerified(true);
    } finally {
      setChecking(false);
    }
  }

  async function resend() {
    if (resendState === "sending") return;
    setResendState("sending");
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.delivery === "already_verified") {
        router.push(next);
        router.refresh();
        return;
      }
      // `res.ok` only means the request was accepted — `delivery` says whether
      // the provider actually sent it (D-053: never claim success it didn't have).
      setResendState(res.ok && data?.delivery === "sent" ? "sent" : "error");
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
        setChangeError(data?.error?.message ?? t.auth.verify.changeEmail.error);
        return;
      }
      setCurrentEmail(data.email);
      setChanging(false);
      setResendState("sent");
    } catch {
      setChangeError(t.auth.errors.noConnection);
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
      <h1 className="mt-5 text-2xl font-bold">{t.auth.verify.title}</h1>
      {initiallySent ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t.auth.verify.sentPrefix}{" "}
          <strong className="text-[var(--color-text)]" data-testid="verify-email-address">
            {currentEmail}
          </strong>{" "}
          {t.auth.verify.sentSuffix}
        </p>
      ) : (
        <div
          role="alert"
          data-testid="verify-email-send-failed"
          className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3 text-sm"
        >
          {t.auth.verify.failedPrefix}{" "}
          <strong className="text-[var(--color-text)]" data-testid="verify-email-address">
            {currentEmail}
          </strong>
          . {t.auth.verify.failedSuffix}
        </div>
      )}

      <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left">
        <h2 className="text-sm font-bold">{t.auth.verify.whatNext.title}</h2>
        <ol className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
          <li>{t.auth.verify.whatNext.step1}</li>
          <li>{t.auth.verify.whatNext.step2}</li>
          <li>{t.auth.verify.whatNext.step3}</li>
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
            {t.auth.verify.openMail}
          </a>
        )}
        <button
          type="button"
          data-testid="verify-email-resend"
          onClick={resend}
          disabled={resendState === "sending"}
          className="min-h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-3 font-medium disabled:opacity-55"
        >
          {resendState === "sending" ? t.auth.verify.resendSending : t.auth.verify.resend}
        </button>
        {resendState === "sent" && (
          <p role="status" className="text-sm text-[var(--color-success)]">
            {t.auth.verify.resendSent}
          </p>
        )}
        {resendState === "error" && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {t.auth.verify.resendError}
          </p>
        )}

        {!changing ? (
          <button
            type="button"
            data-testid="verify-email-change-open"
            onClick={() => setChanging(true)}
            className="text-sm font-medium text-[var(--color-primary)] underline"
          >
            {t.auth.verify.changeEmail.open}
          </button>
        ) : (
          <form onSubmit={changeEmail} className="mt-1 flex flex-col gap-2 text-left">
            <label htmlFor="new-email" className="text-sm font-medium">
              {t.auth.verify.changeEmail.label}
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
                {t.auth.verify.changeEmail.save}
              </button>
              <button
                type="button"
                onClick={() => setChanging(false)}
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-medium"
              >
                {t.auth.verify.changeEmail.cancel}
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          data-testid="verify-email-continue"
          onClick={() => void checkAndContinue()}
          disabled={checking}
          className="mt-2 text-sm font-medium text-[var(--color-text-muted)] underline disabled:opacity-55"
        >
          {checking ? t.auth.verify.continueChecking : t.auth.verify.continueLabel}
        </button>
        {notYetVerified && (
          <p
            role="alert"
            data-testid="verify-email-not-yet"
            className="text-sm text-[var(--color-danger)]"
          >
            {t.auth.verify.notYetVerified}
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-[var(--color-text-muted)]">{t.auth.verify.spamHint}</p>
    </div>
  );
}
