"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
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

  // Keyed by the target email, not the requester — this is deliberately
  // about protecting one inbox from being flooded with reset emails,
  // not about identifying who's asking. Same generic response either
  // way (below) so a rate-limit hit still doesn't reveal whether the
  // email exists.
  const rateLimit = await checkRateLimit(`pwreset:${parsed.data.email}`, {
    max: 3,
    windowMs: 15 * 60 * 1000,
  });

  const user = rateLimit.allowed
    ? await prisma.user.findUnique({ where: { email: parsed.data.email } })
    : null;

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

    await sendEmail({
      to: user.email,
      subject: "Reset your KPC Digital PtW password",
      html: emailLayout(`
        <p style="font-size: 15px; line-height: 1.5;">Hi ${user.name},</p>
        <p style="font-size: 15px; line-height: 1.5;">
          Someone requested a password reset for your account. This link
          expires in 30 minutes. If you didn't request this, you can
          safely ignore this email.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #00366e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 13px; color: #737782;">
          Or paste this link into your browser: ${resetUrl}
        </p>
      `),
    });
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
