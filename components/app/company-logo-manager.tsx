"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 512 * 1024;

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Upload / preview / remove the optional company logo (PRODUCT #39). */
export function CompanyLogoManager({
  initialLogoDataUri,
  canChange,
}: {
  initialLogoDataUri: string | null;
  canChange: boolean;
}) {
  const router = useRouter();
  const [logo, setLogo] = useState(initialLogoDataUri);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("El logo debe ser una imagen PNG o JPEG. No se admite SVG ni otros formatos.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`El logo debe pesar como máximo ${Math.round(MAX_BYTES / 1024)} KB.`);
      return;
    }
    setBusy(true);
    try {
      const dataUri = await fileToDataUri(file);
      const res = await fetch("/api/company/logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dataUri }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "No se pudo guardar el logo.");
        setBusy(false);
        return;
      }
      setLogo(data.logoDataUri);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/company/logo", { method: "DELETE" });
      if (!res.ok) {
        setError("No se pudo quitar el logo.");
        setBusy(false);
        return;
      }
      setLogo(null);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  }

  if (!canChange) {
    return (
      <div className="mt-4">
        {logo ? (
          <img
            src={logo}
            alt="Logo de la empresa"
            data-testid="company-logo-preview"
            className="max-h-20 max-w-[240px] rounded-[var(--radius-sm)] border border-[var(--color-border)] object-contain p-2"
          />
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            Sin logo configurado. Solo un administrador puede añadirlo.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {error && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {logo ? (
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={logo}
            alt="Logo de la empresa"
            data-testid="company-logo-preview"
            className="max-h-20 max-w-[240px] rounded-[var(--radius-sm)] border border-[var(--color-border)] object-contain p-2"
          />
          <div className="flex gap-3">
            <button
              type="button"
              data-testid="company-logo-replace"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-medium disabled:opacity-55"
            >
              Cambiar
            </button>
            <button
              type="button"
              data-testid="company-logo-remove"
              disabled={busy}
              onClick={() => void remove()}
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-danger)] px-4 font-medium text-[var(--color-danger)] disabled:opacity-55"
            >
              Quitar logo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          data-testid="company-logo-upload"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          {busy ? "Subiendo…" : "Subir logo"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        data-testid="company-logo-input"
        className="sr-only"
        onChange={(e) => void onFileChange(e)}
      />
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        PNG o JPEG, máximo {Math.round(MAX_BYTES / 1024)} KB.
      </p>
    </div>
  );
}
