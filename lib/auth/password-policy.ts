/**
 * Password strength policy (SECURITY #53) — isomorphic (no `node:crypto`, no
 * `server-only`) so the exact same rules run in the browser for live
 * feedback AND on the server as the actual enforcement (`lib/auth/index.ts`).
 * The backend is always the source of truth; this file is imported by both.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 200;

export const PASSWORD_REQUIREMENTS_TEXT =
  "Mínimo 12 caracteres, con mayúsculas, minúsculas, números y un símbolo.";

// A representative blocklist of common padded/weak passwords that would
// otherwise slip past the length + character-class rules above. Not
// exhaustive — a practical deterrent, not a breach-corpus check.
const COMMON_PASSWORDS = new Set(
  [
    "password1234",
    "password123!",
    "Password123!",
    "qwertyuiop123",
    "Qwertyuiop123!",
    "letmein123456",
    "iloveyou12345",
    "welcome123456",
    "admin12345678",
    "administrator1",
    "123456789012!",
    "aA1!aA1!aA1!",
    "Passw0rd!2024",
    "Passw0rd!2025",
    "Passw0rd!2026",
    "Changeme123!",
    "P@ssw0rd1234",
  ].map((p) => p.toLowerCase()),
);

export type PasswordCheck = { ok: true } | { ok: false; reason: string };

export function checkPasswordStrength(
  password: string,
  context: { email?: string; companyName?: string } = {},
): PasswordCheck {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, reason: PASSWORD_REQUIREMENTS_TEXT };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      reason: `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
    };
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, reason: PASSWORD_REQUIREMENTS_TEXT };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { ok: false, reason: PASSWORD_REQUIREMENTS_TEXT };
  }
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return { ok: false, reason: "Esta contraseña es demasiado común. Elige otra." };
  }
  const email = context.email?.trim().toLowerCase();
  const companyName = context.companyName?.trim().toLowerCase();
  if (
    (email && lower === email) ||
    (companyName && companyName.length > 2 && lower === companyName)
  ) {
    return {
      ok: false,
      reason: "La contraseña no puede ser igual a tu email o el nombre de tu empresa.",
    };
  }
  return { ok: true };
}

/** Length + complexity only — use `checkPasswordStrength` where email/company context is available. */
export function isStrongEnough(password: string): boolean {
  return checkPasswordStrength(password).ok;
}
