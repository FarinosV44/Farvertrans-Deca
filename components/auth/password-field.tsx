"use client";

import { useState } from "react";

/**
 * Password input with a show/hide affordance (AUTH #30). Keeps `id="password"`
 * and the same visual language as `Field`, so existing selectors and styles
 * are unchanged.
 */
export function PasswordField({
  value,
  onChange,
  autoComplete,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-3">
      <label htmlFor="password" className="block text-sm font-medium">
        Contraseña<span aria-hidden> *</span>
      </label>
      {hint && (
        <p id="password-hint" className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      <div className="relative mt-1">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          required
          aria-describedby={hint ? "password-hint" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="block min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 pr-16 text-base"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          data-testid="password-toggle"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-[var(--color-primary)]"
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
