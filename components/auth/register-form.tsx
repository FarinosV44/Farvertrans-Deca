"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/deca/field";
import { PasswordField } from "@/components/auth/password-field";
import { GoogleButton } from "@/components/auth/google-button";
import { track } from "@/lib/analytics/client";
import { lockAttribution } from "@/lib/attribution/client";
import { safeInternalPath } from "@/lib/auth/safe-redirect";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { useT } from "@/lib/i18n/client";
import { checkPasswordStrength } from "@/lib/auth/password-policy";

const PROFILE_VALUES = ["carrier_goods", "shipper", "operator", "carrier_passengers"] as const;
const PROFILE_ICONS: Record<(typeof PROFILE_VALUES)[number], string> = {
  carrier_goods: "🚚",
  shipper: "📦",
  operator: "🔗",
  carrier_passengers: "🚌",
};

export function RegisterForm({
  initialMode = "register",
  inviteCompany = null,
  inviteEmail = null,
  prospectCompany = null,
  googleEnabled = false,
}: {
  initialMode?: "register" | "login";
  inviteCompany?: string | null;
  inviteEmail?: string | null;
  prospectCompany?: { name: string; nif: string } | null;
  googleEnabled?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const claim = params.get("claim") ?? undefined;
  const invite = params.get("invite") ?? undefined;
  const nextPath = safeInternalPath(params.get("next"));
  // A team invite joins an existing workspace (no company fields); a prospect
  // onboarding link still creates a company (fields shown, prefilled — GROWTH #28).
  const joiningTeam = !!invite && !prospectCompany;

  const [f, setF] = useState({
    email: inviteEmail ?? "",
    password: "",
    companyName: prospectCompany?.name ?? "",
    companyNif: prospectCompany?.nif ?? "",
    companyAddress: "",
    companyContactName: "",
    companyPhone: "",
    companyProfile: "" as "" | (typeof PROFILE_VALUES)[number],
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (mode === "register" && !joiningTeam && !acceptTerms) {
      setError(t.auth.errors.acceptTerms);
      return;
    }
    if (mode === "register") {
      const strength = checkPasswordStrength(f.password, {
        email: f.email,
        companyName: f.companyName,
      });
      if (!strength.ok) {
        setError(strength.reason);
        return;
      }
    }
    setBusy(true);
    setError(null);
    if (mode === "register") track("signup_started");
    const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register"
        ? { ...f, companyProfile: f.companyProfile || undefined, acceptTerms, claim, invite }
        : { email: f.email, password: f.password, claim, invite };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? t.auth.errors.generic);
        setBusy(false);
        return;
      }
      if (mode === "register") {
        track("signup_completed");
        if (!data?.joinedTeam) track("company_created");
        if (f.companyProfile) track("company_profile_selected");
        lockAttribution(); // first-touch is now permanent
        if (data?.claimedDecaId) track("anonymous_deca_claimed");
        if (claim) track("claim_completed");
        if (data?.emailSent) track("email_verification_sent");
        // Every fresh account gets the dedicated confirmation screen (GROWTH #46) —
        // never a dead end: it hands the user straight back to nextPath. `sent`
        // tells the screen the TRUTH about delivery (D-053) — never claim an
        // email arrived when the provider call actually failed.
        router.push(
          `/verificar-email?next=${encodeURIComponent(nextPath)}&sent=${data?.emailSent ? "1" : "0"}`,
        );
        return;
      }
      track("login_completed");
      if (claim) track("claim_completed");
      // `nextPath` may be a page the visitor saw signed-out before logging in
      // (e.g. `/crear`'s registration gate) — refresh() busts Next's client
      // router cache so the just-created session is actually reflected there.
      router.push(nextPath);
      router.refresh();
    } catch {
      setError(t.auth.errors.noConnection);
      setBusy(false);
    }
  }

  const heading = joiningTeam
    ? t.auth.heading.joinTeam
    : claim
      ? t.auth.heading.claim
      : mode === "register"
        ? t.auth.heading.register
        : t.auth.heading.login;

  const subhead = joiningTeam
    ? `${inviteCompany ? t.auth.subhead.joinTeamInvitedBy(inviteCompany) : ""}${t.auth.subhead.joinTeamSuffix}`
    : claim
      ? t.auth.subhead.claim
      : mode === "register"
        ? t.auth.subhead.register
        : t.auth.subhead.login;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]" data-testid="register-subhead">
        {subhead}
      </p>

      <div className="mt-6">
        <GoogleButton
          enabled={googleEnabled}
          label={t.auth.googleCta}
          href={
            invite ? `/api/auth/google?invite=${encodeURIComponent(invite)}` : "/api/auth/google"
          }
        />
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">{t.auth.orContinueWithEmail}</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Field
          id="email"
          label={t.auth.emailLabel}
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
        />
        <PasswordField
          value={f.password}
          onChange={set("password")}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          hint={mode === "register" ? t.auth.passwordHint : undefined}
        />
        {mode === "register" && !joiningTeam && (
          <fieldset className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">{t.auth.company.legend}</legend>
            <Field
              id="companyName"
              label={t.auth.company.name}
              autoComplete="organization"
              value={f.companyName}
              onChange={set("companyName")}
            />
            <Field
              id="companyNif"
              label={t.auth.company.nif}
              value={f.companyNif}
              onChange={set("companyNif")}
            />
            <Field
              id="companyContactName"
              label={t.auth.company.contactName}
              required={false}
              autoComplete="name"
              value={f.companyContactName}
              onChange={set("companyContactName")}
            />
            <Field
              id="companyPhone"
              label={t.auth.company.phone}
              type="tel"
              required={false}
              autoComplete="tel"
              value={f.companyPhone}
              onChange={set("companyPhone")}
            />
            <Field
              id="companyAddress"
              label={t.auth.company.address}
              required={false}
              autoComplete="street-address"
              value={f.companyAddress}
              onChange={set("companyAddress")}
            />
          </fieldset>
        )}

        {mode === "register" && !joiningTeam && (
          <fieldset className="mt-4">
            <legend className="px-1 text-sm font-bold">
              {t.auth.profile.legend} <span aria-hidden>*</span>
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
              {PROFILE_VALUES.map((value) => {
                const p = t.auth.profile.items[value];
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={f.companyProfile === value}
                    data-testid={`profile-${value}`}
                    onClick={() => setF((s) => ({ ...s, companyProfile: value }))}
                    className={`flex min-h-24 flex-col items-start gap-1 rounded-[var(--radius-md)] border p-4 text-left ${
                      f.companyProfile === value
                        ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <span aria-hidden className="text-2xl">
                      {PROFILE_ICONS[value]}
                    </span>
                    <span className="text-sm font-bold">{p.title}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{p.body}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {mode === "register" && !joiningTeam && (
          <div
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4 text-xs text-[var(--color-text-muted)]"
            data-testid="data-protection-notice"
          >
            <p className="font-bold text-[var(--color-text)]">{t.auth.dataProtection.title}</p>
            <p className="mt-1">
              <strong>{t.auth.dataProtection.responsible}</strong> {LEGAL_ENTITY.name}
            </p>
            <p className="mt-1">
              <strong>{t.auth.dataProtection.purpose}</strong> {t.auth.dataProtection.purposeBody}
            </p>
            <p className="mt-1">
              {t.auth.dataProtection.moreInfoPrefix}{" "}
              <Link href={LEGAL_ENTITY.privacyUrl} className="underline">
                {t.auth.dataProtection.privacyPolicy}
              </Link>
              .
            </p>
          </div>
        )}

        {mode === "register" && !joiningTeam && (
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              data-testid="accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              {t.auth.terms.readPrefix}{" "}
              <Link href={LEGAL_ENTITY.privacyUrl} className="underline">
                {t.auth.terms.privacyPolicy}
              </Link>{" "}
              {t.auth.terms.andAccept}{" "}
              <Link href={LEGAL_ENTITY.termsUrl} className="underline">
                {t.auth.terms.termsAndConditions}
              </Link>
              .
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="register-submit"
          className="mt-6 min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-55"
        >
          {busy
            ? t.auth.submit.busy
            : mode === "register"
              ? t.auth.submit.register
              : t.auth.submit.login}
        </button>
      </form>

      {mode === "login" && (
        <p className="mt-3 text-sm">
          <Link href="/recuperar" data-testid="forgot-password">
            {t.auth.forgotPassword}
          </Link>
        </p>
      )}

      <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-muted)]">
        {mode === "register" ? t.auth.switchPrompt.toLogin : t.auth.switchPrompt.toRegister}
        <button
          type="button"
          data-testid="auth-mode-toggle"
          onClick={() => {
            setMode((m) => (m === "register" ? "login" : "register"));
            setError(null);
          }}
          className="font-medium text-[var(--color-primary)] underline"
        >
          {mode === "register" ? t.auth.switchCta.toLogin : t.auth.switchCta.toRegister}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">{t.auth.footNote}</p>
    </div>
  );
}
