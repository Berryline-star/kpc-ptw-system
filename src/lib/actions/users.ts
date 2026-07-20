"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { sendEmail, emailLayout } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — longer than
// a forgot-password link since there's no urgency signal prompting the
// invitee to act quickly the way a self-initiated reset has.

export interface InviteUserState {
  error?: string;
  success?: boolean;
}

export async function inviteUser(
  _prevState: InviteUserState | undefined,
  formData: FormData,
): Promise<InviteUserState> {
  const admin = await requireRole("SYSTEM_ADMIN");

  const rateLimit = await checkRateLimit(`invite:${admin.id}`, {
    max: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return {
      error: "Too many invites sent recently. Try again in a bit.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = formData.get("role") as Role | null;
  const department = String(formData.get("department") ?? "").trim() || null;

  if (!name || name.length < 2) return { error: "Enter the person's full name." };
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };
  if (!role) return { error: "Select a role." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  // Unlike self-registration (registerUser in lib/actions/register.ts),
  // an admin-invited account starts active immediately — the admin is
  // directly vouching for this person, so there's no separate approval
  // step to wait on. They just need to set their own password before
  // they can actually sign in with it.
  const placeholderHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  const user = await prisma.user.create({
    data: { name, email, role, department, passwordHash: placeholderHash, isActive: true },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const setPasswordUrl = `${baseUrl}/reset-password?token=${token}`;

  const emailResult = await sendEmail({
    to: user.email,
    subject: "You've been added to KPC Digital PtW",
    html: emailLayout(`
      <p style="font-size: 15px; line-height: 1.5;">Hi ${name},</p>
      <p style="font-size: 15px; line-height: 1.5;">
        ${admin.name} added you to the KPC Digital Permit-to-Work system
        as a <strong>${role.replace("_", " ")}</strong>. Set a password
        to activate your account. This link expires in 7 days.
      </p>
      <p style="margin: 24px 0;">
        <a href="${setPasswordUrl}" style="background: #00366e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">
          Set Your Password
        </a>
      </p>
      <p style="font-size: 13px; color: #737782;">
        Or paste this link into your browser: ${setPasswordUrl}
      </p>
    `),
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "USER_INVITED",
      targetType: "User",
      targetId: user.id,
      metadata: { email, role, emailDelivered: emailResult.success },
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");

  if (!emailResult.success) {
    return {
      error: `Account created, but the invite email failed to send (${emailResult.error}). Check server logs for the set-password link.`,
    };
  }

  return { success: true };
}

export async function toggleUserActive(userId: string) {
  const admin = await requireRole("SYSTEM_ADMIN");

  if (userId === admin.id) {
    throw new Error("You can't deactivate your own account.");
  }

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { isActive: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isActive: !target.isActive },
    }),
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: target.isActive ? "USER_DEACTIVATED" : "USER_ACTIVATED",
        targetType: "User",
        targetId: userId,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");
}

export async function updateUserRole(userId: string, newRole: Role) {
  const admin = await requireRole("SYSTEM_ADMIN");

  if (userId === admin.id) {
    throw new Error(
      "You can't change your own role — ask another admin to do it.",
    );
  }

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  });

  if (target.role === newRole) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    }),
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "ROLE_CHANGED",
        targetType: "User",
        targetId: userId,
        metadata: { from: target.role, to: newRole },
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");
}
