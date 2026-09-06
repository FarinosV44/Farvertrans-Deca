"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerPasskey, browserSupportsWebAuthn } from "@/lib/auth/webauthn-client";
import { Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";

type Credential = {
  id: string;
  name: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

type TrustedDevice = {
  id: string;
  label: string | null;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string | null;
};

const fmt = (iso: string) => iso.slice(0, 16).replace("T", " ");

const STEP_UP_MESSAGE = "Verifica tu identidad de nuevo para continuar.";

function StepUpNotice() {
  return (
    <p
      role="alert"
      data-testid="step-up-notice"
      className="mt-2 text-sm text-[var(--color-danger)]"
    >
      {STEP_UP_MESSAGE}{" "}
      <Link href="/admin/2fa/verify?next=/admin/seguridad" className="underline">
        Verificar ahora
      </Link>
    </p>
  );
}

function RecoveryCodesModal({ codes, onDismiss }: { codes: string[]; onDismiss: () => void }) {
  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-sm font-medium">Guarda tus nuevos códigos de recuperación</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Cada código solo se puede usar una vez, y solo los verás aquí. Los códigos anteriores han
        dejado de funcionar.
      </p>
      <ul
        data-testid="recovery-codes"
        className="mt-3 grid grid-cols-2 gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg)] p-3 font-mono text-sm"
      >
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="recovery-codes-dismiss"
        onClick={onDismiss}
        className="mt-3 min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
      >
        Ya los he guardado
      </button>
    </div>
  );
}

export function SecurityScreen({
  totpEnabled: initialTotpEnabled,
  credentials: initialCredentials,
  trustedDevices: initialTrustedDevices,
  recoveryCodesRemaining: initialRecoveryCodesRemaining,
}: {
  totpEnabled: boolean;
  credentials: Credential[];
  trustedDevices: TrustedDevice[];
  recoveryCodesRemaining: number;
}) {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [trustedDevices, setTrustedDevices] = useState(initialTrustedDevices);
  const [totpEnabled, setTotpEnabled] = useState(initialTotpEnabled);
  const [recoveryCodesRemaining, setRecoveryCodesRemaining] = useState(
    initialRecoveryCodesRemaining,
  );
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [passkeySupported, setPasskeySupported] = useState(false);

  useEffect(() => {
    setPasskeySupported(browserSupportsWebAuthn());
  }, []);

  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeStepUp, setRemoveStepUp] = useState(false);

  const [totpSetup, setTotpSetup] = useState<{ secret: string; qrDataUri: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpBusy, setTotpBusy] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpStepUp, setTotpStepUp] = useState(false);

  const [regenBusy, setRegenBusy] = useState(false);
  const [regenStepUp, setRegenStepUp] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeStepUp, setRevokeStepUp] = useState(false);

  async function addPasskey() {
    setPasskeyBusy(true);
    setPasskeyError(null);
    const result = await registerPasskey();
    setPasskeyBusy(false);
    if (!result.ok) {
      setPasskeyError(result.error);
      return;
    }
    if (result.data.recoveryCodes) setNewCodes(result.data.recoveryCodes);
    router.refresh();
    const res = await fetch("/api/admin/2fa/webauthn/credentials");
    if (res.ok) {
      const data = await res.json();
      setCredentials(data.credentials);
    }
  }

  async function removePasskey(id: string) {
    setRemovingId(id);
    setRemoveStepUp(false);
    setPasskeyError(null);
    const res = await fetch(`/api/admin/2fa/webauthn/credentials/${id}`, { method: "DELETE" });
    setRemovingId(null);
    if (res.status === 403) {
      setRemoveStepUp(true);
      return;
    }
    if (res.ok) {
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data?.error?.message) setPasskeyError(data.error.message);
  }

  async function startTotpSetup() {
    setTotpError(null);
    const res = await fetch("/api/admin/2fa/enroll", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setTotpError("No se pudo iniciar la configuración. Inténtalo de nuevo.");
      return;
    }
    setTotpSetup({ secret: data.secret, qrDataUri: data.qrDataUri });
  }

  async function confirmTotpSetup(e: React.FormEvent) {
    e.preventDefault();
    setTotpBusy(true);
    setTotpError(null);
    const res = await fetch("/api/admin/2fa/enable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: totpCode }),
    });
    const data = await res.json().catch(() => ({}));
    setTotpBusy(false);
    if (!res.ok) {
      setTotpError(
        data?.error?.code === "invalid_code" ? "Código incorrecto." : "No se pudo activar.",
      );
      return;
    }
    setTotpEnabled(true);
    setTotpSetup(null);
    setTotpCode("");
    if (data.recoveryCodes) {
      setNewCodes(data.recoveryCodes);
      setRecoveryCodesRemaining(data.recoveryCodes.length);
    }
  }

  async function resetTotp() {
    setTotpStepUp(false);
    const res = await fetch("/api/admin/2fa/totp", { method: "DELETE" });
    if (res.status === 403) {
      setTotpStepUp(true);
      return;
    }
    if (res.ok) setTotpEnabled(false);
    else {
      const data = await res.json().catch(() => ({}));
      if (data?.error?.code === "last_method") setTotpError(data.error.message);
    }
  }

  async function regenerateCodes() {
    setRegenBusy(true);
    setRegenStepUp(false);
    const res = await fetch("/api/admin/2fa/regenerate-codes", { method: "POST" });
    setRegenBusy(false);
    if (res.status === 403) {
      setRegenStepUp(true);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNewCodes(data.recoveryCodes);
      setRecoveryCodesRemaining(data.recoveryCodes.length);
    }
  }

  async function revokeDevice(id: string) {
    setRevokingId(id);
    setRevokeStepUp(false);
    const res = await fetch(`/api/admin/2fa/trusted-devices/${id}`, { method: "DELETE" });
    setRevokingId(null);
    if (res.status === 403) {
      setRevokeStepUp(true);
      return;
    }
    if (res.ok) setTrustedDevices((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-8">
      {newCodes && <RecoveryCodesModal codes={newCodes} onDismiss={() => setNewCodes(null)} />}

      <section>
        <h2 className="text-lg font-semibold">Claves de acceso</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Face ID, Touch ID, Windows Hello o el PIN de tu dispositivo — el método principal.
        </p>

        {credentials.length === 0 ? (
          <div className="mt-3">
            <Empty>Ninguna clave de acceso registrada todavía.</Empty>
          </div>
        ) : (
          <div className="mt-3">
            <Table head={["Dispositivo", "Sincronizada", "Añadida", "Último uso", ""]}>
              {credentials.map((c) => (
                <Row key={c.id}>
                  <Cell>{c.name ?? "Clave de acceso"}</Cell>
                  <Cell>
                    <Badge tone={c.backedUp ? "green" : "muted"}>{c.backedUp ? "sí" : "no"}</Badge>
                  </Cell>
                  <Cell mono>{fmt(c.createdAt)}</Cell>
                  <Cell mono>{c.lastUsedAt ? fmt(c.lastUsedAt) : "—"}</Cell>
                  <Cell>
                    <button
                      type="button"
                      data-testid="passkey-remove"
                      onClick={() => removePasskey(c.id)}
                      disabled={removingId === c.id}
                      className="text-sm font-medium text-[var(--color-danger)]"
                    >
                      Quitar
                    </button>
                  </Cell>
                </Row>
              ))}
            </Table>
          </div>
        )}
        {removeStepUp && <StepUpNotice />}

        {passkeySupported && (
          <button
            type="button"
            data-testid="passkey-add-button"
            onClick={addPasskey}
            disabled={passkeyBusy}
            className="mt-4 min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
          >
            {passkeyBusy ? "Confirma en tu dispositivo…" : "Añadir clave de acceso"}
          </button>
        )}
        {passkeyError && (
          <p
            role="alert"
            data-testid="passkey-add-error"
            className="mt-2 text-sm text-[var(--color-danger)]"
          >
            {passkeyError}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">App de autenticación (alternativa)</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Google Authenticator, Microsoft Authenticator, Authy — método de respaldo.
        </p>

        <p className="mt-2 text-sm">
          Estado:{" "}
          <Badge tone={totpEnabled ? "green" : "muted"}>
            {totpEnabled ? "activada" : "no configurada"}
          </Badge>
        </p>

        {totpEnabled ? (
          <>
            <button
              type="button"
              data-testid="totp-reset-button"
              onClick={resetTotp}
              className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)]"
            >
              Restablecer
            </button>
            {totpStepUp && <StepUpNotice />}
            {totpError && (
              <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                {totpError}
              </p>
            )}
          </>
        ) : totpSetup ? (
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={totpSetup.qrDataUri}
              alt="Código QR para configurar la app de autenticación"
              className="h-40 w-40"
              data-testid="totp-inline-qr"
            />
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)]">
                Introducir la clave manualmente
              </summary>
              <p data-testid="totp-inline-secret" className="mt-1 font-mono text-sm break-all">
                {totpSetup.secret}
              </p>
            </details>
            <form onSubmit={confirmTotpSetup} className="mt-3">
              <input
                data-testid="totp-inline-code-input"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="min-h-11 w-full max-w-[10rem] rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-center text-lg tracking-[0.3em]"
              />
              {totpError && (
                <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                  {totpError}
                </p>
              )}
              <button
                type="submit"
                data-testid="totp-inline-confirm"
                disabled={totpBusy || totpCode.length !== 6}
                className="mt-2 min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
              >
                {totpBusy ? "Comprobando…" : "Activar"}
              </button>
            </form>
          </div>
        ) : (
          <button
            type="button"
            data-testid="totp-configure-button"
            onClick={startTotpSetup}
            className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)]"
          >
            Configurar
          </button>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Códigos de recuperación</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          <span data-testid="recovery-remaining">{recoveryCodesRemaining}</span> código
          {recoveryCodesRemaining === 1 ? "" : "s"} sin usar.
        </p>
        <button
          type="button"
          data-testid="regenerate-codes-button"
          onClick={regenerateCodes}
          disabled={regenBusy}
          className="mt-3 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] disabled:opacity-55"
        >
          {regenBusy ? "Generando…" : "Regenerar códigos"}
        </button>
        {regenStepUp && <StepUpNotice />}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Dispositivos de confianza</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Dispositivos donde elegiste no repetir la verificación durante 30 días.
        </p>
        {trustedDevices.length === 0 ? (
          <div className="mt-3">
            <Empty>Ningún dispositivo de confianza activo.</Empty>
          </div>
        ) : (
          <div className="mt-3">
            <Table head={["Dispositivo", "Concedido", "Expira", "Último uso", ""]}>
              {trustedDevices.map((d) => (
                <Row key={d.id}>
                  <Cell>{d.label ?? "—"}</Cell>
                  <Cell mono>{fmt(d.createdAt)}</Cell>
                  <Cell mono>{fmt(d.expiresAt)}</Cell>
                  <Cell mono>{d.lastSeenAt ? fmt(d.lastSeenAt) : "—"}</Cell>
                  <Cell>
                    <button
                      type="button"
                      data-testid="trusted-device-revoke"
                      onClick={() => revokeDevice(d.id)}
                      disabled={revokingId === d.id}
                      className="text-sm font-medium text-[var(--color-danger)]"
                    >
                      Revocar
                    </button>
                  </Cell>
                </Row>
              ))}
            </Table>
          </div>
        )}
        {revokeStepUp && <StepUpNotice />}
      </section>
    </div>
  );
}
