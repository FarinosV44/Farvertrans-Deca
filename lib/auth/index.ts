import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, isStrongEnough, verifyPassword } from "./password";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession, verifySession } from "./session";

/**
 * v1 authentication (D-021): own email + password with an HMAC-signed httpOnly
 * session cookie. The `user.authUserId` column is kept so a later swap to
 * Supabase Auth is additive. Signup is deliberately minimal — email, password,
 * company name + NIF + address; never a lead-qualification field.
 */

export class AuthError extends Error {
  constructor(
    public code: "email_taken" | "invalid_credentials" | "weak_password" | "bad_input",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const normEmail = (e: string) => e.trim().toLowerCase();

export type SignupInput = {
  email: string;
  password: string;
  company: { name: string; nif: string; address: string };
};

export async function signup(input: SignupInput): Promise<{ userId: string; companyId: string }> {
  const email = normEmail(input.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new AuthError("bad_input", "Email no válido.");
  if (!isStrongEnough(input.password))
    throw new AuthError("weak_password", "La contraseña debe tener al menos 8 caracteres.");
  if (!input.company.name.trim() || !input.company.nif.trim())
    throw new AuthError("bad_input", "Indica el nombre y el NIF de la empresa.");

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) throw new AuthError("email_taken", "Ya existe una cuenta con este email.");

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.company.name.trim(),
        nif: input.company.nif.trim(),
        address: input.company.address.trim() || null,
      },
    });
    const user = await tx.user.create({
      data: {
        authUserId: `local:${crypto.randomUUID()}`,
        email,
        companyId: company.id,
        passwordHash: hashPassword(input.password),
      },
    });
    return { userId: user.id, companyId: company.id };
  });
  return result;
}

export async function login(emailRaw: string, password: string): Promise<{ userId: string }> {
  const email = normEmail(emailRaw);
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new AuthError("invalid_credentials", "Email o contraseña incorrectos.");
  }
  return { userId: user.id };
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(userId), SESSION_COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const uid = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid }, include: { company: true } });
}
