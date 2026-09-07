import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/brand", () => ({
  BRAND: {
    supportPhone: "607 52 77 19",
    supportEmail: "Deca@praetoriaabogados.es",
    supportWhatsapp: "",
    legalWhatsapp: "",
    supportHours: "",
  },
}));

const load = () => import("@/lib/support/channels");

describe("support channels (#63)", () => {
  it("always offers phone + email for technical support", async () => {
    const { techSupportChannels } = await load();
    const kinds = techSupportChannels().map((c) => c.kind);
    expect(kinds).toContain("phone");
    expect(kinds).toContain("email");
    expect(techSupportChannels().find((c) => c.kind === "phone")?.href).toBe("tel:607527719");
  });

  it("hides the WhatsApp channels while their numbers are not configured", async () => {
    const { techSupportChannels, legalAssistanceChannel } = await load();
    expect(techSupportChannels().some((c) => c.kind === "whatsapp")).toBe(false);
    expect(legalAssistanceChannel()).toBeNull();
  });

  it("builds a wa.me deep link with a purpose-specific message once a number is set", async () => {
    const { whatsappLink } = await load();
    const link = whatsappLink("+34 607 52 77 19", "Hola");
    expect(link).toBe("https://wa.me/34607527719?text=Hola");
    expect(whatsappLink("", "x")).toBeNull();
  });
});
