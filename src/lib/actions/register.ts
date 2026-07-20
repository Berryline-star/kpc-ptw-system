"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export interface RegisterState {
  error?: string;
  success?: boolean;
}

export async function registerUser(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  // Keyed by IP, not email — the concern here is one source spinning up
  // many accounts (each with a different email), not repeated attempts
  // on one email. That's a different attack shape than password-reset's
  // per-email limit.
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`register:${ip}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return {
      error: "Too many registration attempts from this connection. Try again later.",
    };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    department: formData.get("department") || undefined,
    role: formData.get("role"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, department, role, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      department,
      role,
      passwordHash,
      // New self-registered accounts start inactive. auth.ts already
      // blocks sign-in for inactive users, so this account genuinely
      // can't log in until a SYSTEM_ADMIN flips it on from
      // /admin/users — there's no separate approval mechanism to build,
      // the gate we already had for user management does double duty.
      isActive: false,
    },
  });

  return { success: true };
}
