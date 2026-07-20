import { prisma } from "@/lib/prisma";
import type { NotificationType, Role, Prisma } from "@prisma/client";

interface NotifyUserInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedPermitId?: string;
}

/** Returns a Prisma.PrismaPromise so callers can bundle this into the
 * same $transaction as the mutation that triggered it — a notification
 * should never exist for a status change that itself failed to save. */
export function notifyUser({
  userId,
  type,
  title,
  message,
  relatedPermitId,
}: NotifyUserInput): Prisma.PrismaPromise<{ id: string }> {
  return prisma.notification.create({
    data: { userId, type, title, message, relatedPermitId },
    select: { id: true },
  });
}

/**
 * Approval steps are assigned to a *role*, not a specific person (see
 * ApprovalStep.requiredRole), so "notify the approver" means every
 * active user holding that role. Returns an array of PrismaPromises —
 * spread these into the same $transaction as the rest of the mutation.
 */
export async function notifyUsersWithRole(
  role: Role,
  input: Omit<NotifyUserInput, "userId">,
): Promise<Prisma.PrismaPromise<{ id: string }>[]> {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });
  return users.map((u) => notifyUser({ ...input, userId: u.id }));
}
