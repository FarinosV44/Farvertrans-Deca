import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { CtaButton } from "@/components/site/cta-button";
import { publicEnv } from "@/lib/env";
import { HERO } from "@/lib/content/landing";
import { LEGAL_SOURCE } from "@/lib/content/landing";

export const metadata: Metadata = {
  title: "¿Estoy obligado a hacer el DeCA?",
  description:
    "Comprueba en 30 segundos si estás obligado a generar el Documento Electrónico de Control Administrativo (DeCA) del transporte de mercancías por carretera.",
  alternates: { canonical: `${publicEnv.baseUrl}/soy-obligado` },
};

type SP = { ambito?: string; rol?: string; tipo?: string };

function conclude(sp: SP): { level: "si" | "probable" | "no" | "incompleto"; text: string } {
  if (!sp.ambito || !sp.rol || !sp.tipo) return { level: "incompleto", text: "Responde las tres preguntas para ver el resultado." };
  if (sp.ambito === "internacional")
    return {
      level: "no",
      text: "El DeCA se refiere al transporte interior. En transporte internacional se usa la documentación propia de ese ámbito (por ejemplo, la carta de porte CMR). Para el tramo interior de un porte internacional, comprueba si necesitas también el documento de control.",
    };
  if (sp.tipo === "privado")
    return {
      level: "probable",
      text: "El transporte privado complementario puede estar exento del documento de control en determinados supuestos. Revisa tu caso concreto en la normativa antes de descartarlo.",
    };
  if (sp.rol === "cargador")
    return {
      level: "si",
      text: "Como cargador contractual que contrata un transporte público de mercancías por carretera en el interior, estás obligado a que exista el DeCA y a conservarlo al menos un año.",
    };
  return {
    level: "si",
    text: "Como transportista efectivo (empresa o autónomo) de un transporte público de mercancías por carretera en el interior, estás obligado a generar/llevar el DeCA y a conservarlo al menos un año. Debe entregarse una copia al conductor antes del inicio del servicio.",
  };
}

function Radio({ name, value, label, current }: { name: string; value: string; label: string; current?: string }) {
  return (
    <label className="flex items-center gap-2 py-1">
      <input type="radio" name={name} value={value} defaultChecked={current === value} />
      <span>{label}</span>
    </label>
  );
}

export default async function SoyObligadoPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const result = conclude(sp);

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[640px] px-4 pb-24 pt-10 md:px-6 md:pb-12">
        <h1 className="text-3xl font-bold md:text-4xl">¿Estoy obligado a hacer el DeCA?</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Tres preguntas. No guardamos ninguna respuesta. Esto es orientativo; la referencia es la norma.
        </p>

        <form method="get" className="mt-6 space-y-5">
          <fieldset className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">1. Ámbito del transporte</legend>
            <Radio name="ambito" value="interior" label="Interior (nacional)" current={sp.ambito} />
            <Radio name="ambito" value="internacional" label="Internacional" current={sp.ambito} />
          </fieldset>
          <fieldset className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">2. ¿Es transporte público o privado?</legend>
            <Radio name="tipo" value="publico" label="Público (transporte por cuenta ajena)" current={sp.tipo} />
            <Radio name="tipo" value="privado" label="Privado complementario (para mi propia actividad)" current={sp.tipo} />
          </fieldset>
          <fieldset className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-bold">3. ¿Qué papel tienes en el servicio?</legend>
            <Radio name="rol" value="transportista" label="Transportista efectivo (empresa o autónomo que hace el porte)" current={sp.rol} />
            <Radio name="rol" value="cargador" label="Cargador contractual / agencia / operador que contrata el transporte" current={sp.rol} />
          </fieldset>
          <button
            type="submit"
            className="min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 font-medium text-[var(--color-primary-contrast)]"
          >
            Ver si estoy obligado
          </button>
        </form>

        {result.level !== "incompleto" && (
          <div
            role="status"
            className={`mt-6 rounded-[var(--radius-md)] border p-5 ${
              result.level === "no"
                ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                : "border-[var(--color-primary)] bg-[var(--color-surface)]"
            }`}
          >
            <p className="font-bold">
              {result.level === "si" ? "Sí, estás obligado" : result.level === "probable" ? "Depende de tu caso" : "No, en este caso no"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text)]">{result.text}</p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Fuente:{" "}
              <a href={LEGAL_SOURCE.url} target="_blank" rel="noopener noreferrer">
                {LEGAL_SOURCE.label}
              </a>
            </p>
            {result.level !== "no" && (
              <div className="mt-4">
                <CtaButton>{HERO.cta}</CtaButton>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-sm">
          <Link href="/quien-esta-obligado-deca">Más detalle: quién está obligado a hacer el DeCA</Link>
        </p>
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
