"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();

  // Scoped to the current user's id so one person can't mark another
  // person's notifications read by guessing an id.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
