"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function requestPasswordReset(
  _prevState: { message?: string } | undefined,
  formData: FormData,
) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { message: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Same response whether or not the email exists — don't leak which
  // addresses are registered.
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // TODO: send this via a real email provider (Resend/Nodemailer) once
    // one is wired up. Logged for now so the flow is testable without an
    // email service configured.
    console.log(`[password reset] ${user.email} -> ${resetUrl}`);
  }

  return {
    message:
      "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPassword(
  _prevState: { message?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { message: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, message: "Password updated. You can now sign in." };
}
