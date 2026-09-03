import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear DeCA gratis",
  description:
    "Crea tu Documento Electrónico de Control sin registrarte. 3 pasos, PDF nativo con QR.",
};

// Placeholder for the anonymous 3-step creator (BUILD 07). Kept minimal and real
// so the landing CTA has a working destination from BUILD 05 onward.
export default function CrearPage() {
  return (
    <main id="contenido" className="mx-auto max-w-[720px] px-4 py-16 md:px-6">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Paso 1 de 3</p>
      <h1 className="mt-1 text-2xl font-bold md:text-3xl">Crea tu DeCA</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">
        No necesitas registrarte para crear tu primer DeCA.
      </p>
      <p className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        El formulario guiado de 3 pasos se implementa en BUILD 07.
      </p>
    </main>
  );
}
