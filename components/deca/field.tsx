"use client";

export function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  required = true,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="mt-3">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block min-h-12 w-full rounded-[var(--radius-sm)] border px-3 text-base ${
          error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
