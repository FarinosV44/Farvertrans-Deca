import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSpanishPostalCode, isValidPhone } from "@/lib/validation/spanish";
import { companyDataComplete } from "@/lib/company/completeness";

export const runtime = "nodejs";

/**
 * Editable company ficha fields (#59). `name` and `nif` are NOT here — they
 * identify the legal entity and stay locked for the user (only the
 * superadmin can correct them, #62). An empty string is rejected for a
 * mandatory field rather than clearing it: once #59 is in force these fields
 * are required, and the soft gate expects them present.
 */
const bodySchema = z.object({
  email: z.string().trim().max(160).email("El correo electrónico no es válido"),
  phone: z.string().trim().max(20).refine(isValidPhone, "El teléfono no tiene un formato válido"),
  address: z.string().trim().min(4, "Indica la dirección").max(300),
  postalCode: z.string().trim().refine(isValidSpanishPostalCode, "El código postal no es válido"),
  city: z.string().trim().min(2, "Indica la población").max(120),
  contactName: z.string().trim().min(2, "Indica la persona de contacto").max(120),
});

/**
 * Update the company's contact ficha (email/phone/address/postal code/town/
 * contact person) — owner-only, a company-wide setting like the logo. On a
 * complete, valid submission `dataCompletedAt` is stamped, which lifts the
 * #59 soft gate for a company registered before the requirement.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json(
      {
        error: {
          code: "bad_input",
          message: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
        },
      },
      { status: 422 },
    );

  const b = parsed.data;
  const merged = {
    name: user.company?.name ?? "",
    nif: user.company?.nif ?? "",
    email: b.email,
    phone: b.phone,
    address: b.address,
    postalCode: b.postalCode,
    city: b.city,
    contactName: b.contactName,
  };
  const nowComplete = companyDataComplete(merged);

  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: {
      email: b.email,
      phone: b.phone,
      address: b.address,
      postalCode: b.postalCode,
      city: b.city,
      contactName: b.contactName,
      ...(nowComplete && !user.company?.dataCompletedAt ? { dataCompletedAt: new Date() } : {}),
    },
    select: {
      email: true,
      phone: true,
      address: true,
      postalCode: true,
      city: true,
      contactName: true,
      dataCompletedAt: true,
    },
  });

  return NextResponse.json({ ok: true, company, complete: nowComplete });
}
