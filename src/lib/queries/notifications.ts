import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { icon: string; badgeClass: string; label: string }
> = {
  URGENT: {
    icon: "warning",
    badgeClass: "bg-error-container text-on-error-container",
    label: "Urgent",
  },
  SAFETY_ALERT: {
    icon: "shield_with_heart",
    badgeClass: "bg-secondary-container/20 text-secondary",
    label: "Safety Alert",
  },
  APPROVAL_REQUEST: {
    icon: "how_to_reg",
    badgeClass: "bg-primary/10 text-primary",
    label: "Approval Request",
  },
  SYSTEM_UPDATE: {
    icon: "info",
    badgeClass: "bg-surface-container-high text-on-surface-variant",
    label: "System Update",
  },
};

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      relatedPermit: {
        select: { id: true, permitNumber: true },
      },
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
