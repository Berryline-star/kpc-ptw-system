import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";
import type { PermitStatus } from "@prisma/client";

const WARNING_WINDOW_HOURS = 24;
const LIVE_STATUSES: PermitStatus[] = ["APPROVED", "ACTIVE"];
const EXPIRY_WARNING_TITLE = "Permit expiring soon";

function formatDate(date: Date): string {
  return date.toLocaleString("en-KE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export interface ExpiryCheckResult {
  permitsActivated: number;
  warningsSent: number;
  permitsExpired: number;
}

/**
 * Meant to run on a schedule (see /api/cron/permit-expiry), not from a
 * user action. Three independent passes:
 *
 * 1. Activate: any APPROVED permit whose start date has arrived (and
 *    whose end date hasn't already passed too) becomes ACTIVE. Before
 *    this, nothing in the codebase ever set a permit to ACTIVE at
 *    all — approved permits just stayed "APPROVED" forever, even after
 *    work had actually started, so the dashboard's Active Permits count
 *    and the permit detail page's "live" indicator were both silently
 *    wrong.
 * 2. Warn: any live permit ending within WARNING_WINDOW_HOURS gets a
 *    URGENT notification to its creator + supervisor — but only once
 *    per permit (checked by looking for an existing notification with
 *    the same title+permit, since there's no separate "reminded"
 *    boolean on Permit to track this).
 * 3. Expire: any live permit whose end date has already passed gets
 *    flipped to EXPIRED, with a matching activity log entry and
 *    notification. This is also what the dashboard's "Expired Permits"
 *    counter was already querying for (`status: "EXPIRED"`) — nothing
 *    was ever setting that status before this either.
 */
export async function runPermitExpiryCheck(): Promise<ExpiryCheckResult> {
  const now = new Date();

  const toActivate = await prisma.permit.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: now },
      endDate: { gt: now },
    },
    select: { id: true, permitNumber: true, createdById: true },
  });

  for (const permit of toActivate) {
    await prisma.$transaction([
      prisma.permit.update({
        where: { id: permit.id },
        data: { status: "ACTIVE" },
      }),
      prisma.activityEntry.create({
        data: {
          permitId: permit.id,
          authorId: null,
          type: "STATUS_CHANGE",
          message: "System: automatically marked ACTIVE — start date has arrived.",
        },
      }),
      notifyUser({
        userId: permit.createdById,
        type: "SYSTEM_UPDATE",
        title: "Permit now active",
        message: `Permit #${permit.permitNumber}'s start date has arrived — it's now active.`,
        relatedPermitId: permit.id,
      }),
    ]);
  }

  const warningCutoff = new Date(
    now.getTime() + WARNING_WINDOW_HOURS * 60 * 60 * 1000,
  );

  const soonToExpire = await prisma.permit.findMany({
    where: {
      status: { in: LIVE_STATUSES },
      endDate: { gt: now, lte: warningCutoff },
    },
    select: {
      id: true,
      permitNumber: true,
      endDate: true,
      createdById: true,
      supervisorId: true,
    },
  });

  let warningsSent = 0;
  for (const permit of soonToExpire) {
    const alreadyWarned = await prisma.notification.findFirst({
      where: { relatedPermitId: permit.id, title: EXPIRY_WARNING_TITLE },
      select: { id: true },
    });
    if (alreadyWarned) continue;

    const recipientIds = new Set(
      [permit.createdById, permit.supervisorId].filter(
        (id): id is string => !!id,
      ),
    );

    for (const userId of recipientIds) {
      await notifyUser({
        userId,
        type: "URGENT",
        title: EXPIRY_WARNING_TITLE,
        message: `Permit #${permit.permitNumber} expires ${formatDate(permit.endDate)} — renew or close it out before then.`,
        relatedPermitId: permit.id,
      });
    }
    warningsSent++;
  }

  const overdue = await prisma.permit.findMany({
    where: { status: { in: LIVE_STATUSES }, endDate: { lt: now } },
    select: { id: true, permitNumber: true, createdById: true },
  });

  for (const permit of overdue) {
    await prisma.$transaction([
      prisma.permit.update({
        where: { id: permit.id },
        data: { status: "EXPIRED" },
      }),
      prisma.activityEntry.create({
        data: {
          permitId: permit.id,
          authorId: null,
          type: "STATUS_CHANGE",
          message:
            "System: automatically marked EXPIRED — end date has passed.",
        },
      }),
      notifyUser({
        userId: permit.createdById,
        type: "URGENT",
        title: "Permit expired",
        message: `Permit #${permit.permitNumber} has passed its end date and is now marked EXPIRED.`,
        relatedPermitId: permit.id,
      }),
    ]);
  }

  return {
    permitsActivated: toActivate.length,
    warningsSent,
    permitsExpired: overdue.length,
  };
}
