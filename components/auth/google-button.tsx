"use client";

/**
 * "Continuar con Google" (AUTH #30). The real handshake lands with the OAuth
 * slice; until `enabled` is true the button is present in the design but
 * inert, with a caption saying so — never a dead-looking control.
 */
export function GoogleButton({
  enabled,
  label,
  href = "/api/auth/google",
}: {
  enabled: boolean;
  label: string;
  href?: string;
}) {
  const inner = (
    <>
      <GoogleMark />
      <span>{label}</span>
    </>
  );
  const cls =
    "flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

  if (!enabled) {
    return (
      <div>
        <button
          type="button"
          disabled
          aria-disabled
          className={`${cls} cursor-not-allowed opacity-55`}
        >
          {inner}
        </button>
        <p className="mt-1.5 text-center text-xs text-[var(--color-text-muted)]">
          Acceso con Google disponible muy pronto.
        </p>
      </div>
    );
  }

  return (
    <a href={href} data-testid="google-auth" className={`${cls} no-underline`}>
      {inner}
    </a>
  );
}

/** The official four-colour Google "G", correct proportions. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.20455c0-.63864-.05727-1.25182-.16364-1.84091H9v3.48136h4.84364c-.20864 1.125-.84273 2.07818-1.79591 2.71636v2.25818h2.90864c1.70182-1.56682 2.68364-3.87409 2.68364-6.61227z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.46727-.80591 5.95636-2.18045l-2.90864-2.25818c-.80591.54-1.83681.85909-3.04772.85909-2.34409 0-4.32818-1.58318-5.03591-3.71045H.957275v2.33181C2.43818 15.9832 5.48182 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96409 10.71c-.18-.54-.28227-1.11682-.28227-1.71s.10227-1.17.28227-1.71V4.95818H.957275C.347727 6.17318 0 7.54773 0 9s.347727 2.82682.957275 4.04182L3.96409 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.57955c1.32136 0 2.50773.45409 3.44045 1.34591l2.58136-2.58136C13.4632.891818 11.4259 0 9 0 5.48182 0 2.43818 2.01682.957275 4.95818L3.96409 7.29c.70773-2.12727 2.69182-3.71045 5.03591-3.71045z"
      />
    </svg>
  );
}
