"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

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
  const empresa = useT().panel.empresa;
  const t = empresa.logo;
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
      setError(t.invalidFormat);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t.tooLarge(Math.round(MAX_BYTES / 1024)));
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
        setError(data?.error?.message ?? t.saveError);
        setBusy(false);
        return;
      }
      setLogo(data.logoDataUri);
      router.refresh();
    } catch {
      setError(empresa.offlineError);
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/company/logo", { method: "DELETE" });
      if (!res.ok) {
        setError(t.removeError);
        setBusy(false);
        return;
      }
      setLogo(null);
      router.refresh();
    } catch {
      setError(empresa.offlineError);
    }
    setBusy(false);
  }

  if (!canChange) {
    return (
      <div className="mt-4">
        {logo ? (
          <img
            src={logo}
            alt={t.altText}
            data-testid="company-logo-preview"
            className="max-h-20 max-w-[240px] rounded-[var(--radius-sm)] border border-[var(--color-border)] object-contain p-2"
          />
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">{t.noneConfigured}</p>
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
            alt={t.altText}
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
              {t.replace}
            </button>
            <button
              type="button"
              data-testid="company-logo-remove"
              disabled={busy}
              onClick={() => void remove()}
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-danger)] px-4 font-medium text-[var(--color-danger)] disabled:opacity-55"
            >
              {t.remove}
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
          {busy ? t.uploading : t.upload}
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
        {t.hint(Math.round(MAX_BYTES / 1024))}
      </p>
    </div>
  );
}
