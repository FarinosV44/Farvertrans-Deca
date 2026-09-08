import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/brand", () => ({
  BRAND: {
    supportPhone: "607 52 77 19",
    supportEmail: "Deca@praetoriaabogados.es",
    supportWhatsapp: "34607527719",
    legalWhatsapp: "34607527719",
    supportHours: "",
  },
}));

const load = () => import("@/lib/support/channels");

describe("support channels (#63, #86 p4/p6)", () => {
  it("technical support leads with WhatsApp + email — no conventional phone (#86 p4)", async () => {
    const { techSupportChannels } = await load();
    const kinds = techSupportChannels().map((c) => c.kind);
    expect(kinds).toContain("whatsapp");
    expect(kinds).toContain("email");
    expect(kinds).not.toContain("phone");
  });

  it("the legal WhatsApp channel is available (own number/message) (#86 p6)", async () => {
    const { legalAssistanceChannel } = await load();
    const legal = legalAssistanceChannel();
    expect(legal?.kind).toBe("whatsapp");
    expect(legal?.href).toContain("wa.me/34607527719");
  });

  it("builds a wa.me deep link with a purpose-specific message once a number is set", async () => {
    const { whatsappLink } = await load();
    const link = whatsappLink("+34 607 52 77 19", "Hola");
    expect(link).toBe("https://wa.me/34607527719?text=Hola");
    expect(whatsappLink("", "x")).toBeNull();
  });
});
