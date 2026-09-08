import { BRAND } from "@/lib/brand";

/**
 * The support / legal-assistance channels shown in the panel help centre
 * (#63). Everything is centralised in `lib/brand.ts` — this module only
 * shapes it. A WhatsApp channel is omitted entirely when its number is not
 * configured, so an unconfirmed channel never appears.
 */

export type SupportChannel = {
  kind: "phone" | "email" | "whatsapp";
  href: string;
  value: string;
};

const digits = (s: string) => s.replace(/\D/g, "");

/** `wa.me` deep link with a distinct pre-filled first message per purpose. */
export function whatsappLink(number: string, message: string): string | null {
  const n = digits(number);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/**
 * Technical-support channels (#86 p6). A conventional phone is NO LONGER the
 * primary channel — WhatsApp leads, then email; the panel also shows the
 * "open a ticket" form alongside these. The phone is dropped from this list.
 */
export function techSupportChannels(): SupportChannel[] {
  const out: SupportChannel[] = [];
  const wa = whatsappLink(
    BRAND.supportWhatsapp,
    "Hola, necesito ayuda técnica con DeCA Profesional.",
  );
  if (wa) out.push({ kind: "whatsapp", href: wa, value: "WhatsApp" });
  out.push({ kind: "email", href: `mailto:${BRAND.supportEmail}`, value: BRAND.supportEmail });
  return out;
}

/**
 * Legal-assistance channel — specialist transport & logistics lawyers
 * (PRAETORIA). Rendered only when its WhatsApp number is configured; the
 * email/phone above already cover general contact.
 */
export function legalAssistanceChannel(): SupportChannel | null {
  const wa = whatsappLink(
    BRAND.legalWhatsapp,
    "Hola, me gustaría consultar con el departamento jurídico de transporte.",
  );
  return wa ? { kind: "whatsapp", href: wa, value: "WhatsApp jurídico" } : null;
}
