import { describe, expect, it } from "vitest";
import { calloutVariant, parseImageLine, CALLOUT_LABEL } from "@/lib/content/markdown-toc";

/** #111 — block-syntax parsers added for the product usage guide. */

describe("calloutVariant", () => {
  it("recognises the three typed callouts", () => {
    expect(calloutVariant("::: tip")).toBe("tip");
    expect(calloutVariant("::: important")).toBe("important");
    expect(calloutVariant("  ::: example  ")).toBe("example");
  });

  it("does not treat the FAQ fence or a bare fence as a callout", () => {
    expect(calloutVariant("::: faq")).toBeNull();
    expect(calloutVariant(":::")).toBeNull();
    expect(calloutVariant("::: unknown")).toBeNull();
  });

  it("has a Spanish label for every variant", () => {
    expect(CALLOUT_LABEL).toEqual({ tip: "Consejo", important: "Importante", example: "Ejemplo" });
  });
});

describe("parseImageLine", () => {
  it("parses a local image with a caption", () => {
    expect(
      parseImageLine('![Pantalla de creación](/guia/crear.png "Paso 1 del asistente")'),
    ).toEqual({
      alt: "Pantalla de creación",
      src: "/guia/crear.png",
      caption: "Paso 1 del asistente",
    });
  });

  it("parses a local image without a caption", () => {
    expect(parseImageLine("![Mis DeCA](/guia/mis-deca.png)")).toEqual({
      alt: "Mis DeCA",
      src: "/guia/mis-deca.png",
      caption: null,
    });
  });

  it("rejects remote URLs — guide images are always local assets", () => {
    expect(parseImageLine("![x](https://example.com/x.png)")).toBeNull();
    expect(parseImageLine("![x](//evil.test/x.png)")).toBeNull();
  });

  it("rejects a line that only contains an image among other text", () => {
    expect(parseImageLine("mira esto ![x](/guia/x.png) y más")).toBeNull();
  });

  it("allows an empty alt", () => {
    expect(parseImageLine("![](/guia/x.png)")).toEqual({
      alt: "",
      src: "/guia/x.png",
      caption: null,
    });
  });
});
