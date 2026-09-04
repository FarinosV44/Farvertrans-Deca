import { describe, expect, it } from "vitest";
import { contentWarnings } from "@/lib/content/schema";
import { extractHeadings, slugifyHeading } from "@/lib/content/markdown-toc";

describe("contentWarnings (SEO #32 — editorial checks, not a fake score)", () => {
  const ok = {
    title: "Cómo corregir un DeCA",
    seoTitle: "Cómo corregir un DeCA en tres pasos",
    metaDescription:
      "Corregir un DeCA genera una versión nueva con QR y URL propios; la versión anterior se conserva. Guía práctica.",
    body: "## Paso 1\n\nEsto es contenido con [[cta]] al generador.",
    sources: [{ label: "BOE", url: "https://boe.es" }],
    category: "Uso",
    type: "guide" as const,
  };

  it("is quiet on a well-formed item", () => {
    expect(contentWarnings(ok)).toEqual([]);
  });

  it("flags a missing meta description", () => {
    expect(contentWarnings({ ...ok, metaDescription: "" }).map((w) => w.field)).toContain(
      "metaDescription",
    );
  });

  it("flags an SEO title over 60 characters", () => {
    const long =
      "Cómo corregir o modificar un DeCA paso a paso sin perder la versión anterior nunca";
    expect(contentWarnings({ ...ok, seoTitle: long }).map((w) => w.field)).toContain("seoTitle");
  });

  it("flags a body with no CTA to the generator", () => {
    expect(
      contentWarnings({
        ...ok,
        body: "## Sección\n\nTexto sin llamada a la acción alguna aquí.",
      }).map((w) => w.field),
    ).toContain("body");
  });

  it("flags normative content with no sources cited", () => {
    expect(
      contentWarnings({
        ...ok,
        body: "Segun la resolución del BOE el DeCA es obligatorio. [[cta]]",
        sources: [],
      }).map((w) => w.field),
    ).toContain("sources");
  });
});

describe("markdown headings (table of contents)", () => {
  it("slugifies accented headings for stable anchors", () => {
    expect(slugifyHeading("¿Quién está obligado?")).toBe("quien-esta-obligado");
    expect(slugifyHeading("Paso 1 · Datos")).toBe("paso-1-datos");
  });

  it("extracts h2 and h3 in document order", () => {
    const md = "# Título\n\n## Primero\n\ntexto\n\n### Sub\n\n## Segundo";
    expect(extractHeadings(md)).toEqual([
      { level: 2, text: "Primero", id: "primero" },
      { level: 3, text: "Sub", id: "sub" },
      { level: 2, text: "Segundo", id: "segundo" },
    ]);
  });
});
