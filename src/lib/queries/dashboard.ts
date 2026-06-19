import { prisma } from "@/lib/prisma";
import type { PermitType, RiskLevel } from "@prisma/client";

const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  HOT_WORK: "Hot Work",
  COLD_WORK: "Cold Work",
  CONFINED_SPACE: "Confined Space",
  EXCAVATION: "Excavation",
  WORKING_AT_HEIGHT: "Working at Height",
  ELECTRICAL: "Electrical",
};

// Distinct chart colors per permit type, pulled from the design tokens
// (KPC Blue, Safety Orange, Secondary, Outline gray) plus two extras for
// the two permit types beyond what the mockup's 4-color legend showed.
const PERMIT_TYPE_COLORS: Record<PermitType, string> = {
  HOT_WORK: "#00366e", // primary
  COLD_WORK: "#fe6500", // secondary-container
  CONFINED_SPACE: "#a33e00", // secondary
  EXCAVATION: "#737782", // outline
  WORKING_AT_HEIGHT: "#245eaa", // surface-tint
  ELECTRICAL: "#9bbfff", // on-primary-container
};

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend?: { direction: "up" | "down"; value: string };
  tone: "primary" | "secondary" | "error" | "tertiary";
  caption?: string;
}

export interface PermitTypeSlice {
  type: PermitType;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface RiskBucket {
  level: RiskLevel;
  label: string;
  count: number;
  percent: number;
}

export interface TrendPoint {
  day: string;
  count: number;
}

export interface ActivityFeedEntry {
  id: string;
  message: string;
  permitNumber: string | null;
  authorName: string | null;
  createdAt: Date;
  kind: "created" | "approved" | "rejected" | "updated" | "closed" | "comment";
}

export interface DashboardData {
  statCards: StatCard[];
  permitTypeDistribution: PermitTypeSlice[];
  riskBreakdown: RiskBucket[];
  weeklyTrend: TrendPoint[];
  recentActivity: ActivityFeedEntry[];
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    tone: "error" | "secondary" | "primary" | "neutral";
    icon: string;
  }>;
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(now.getDate() - 1);

  const [
    activeCount,
    pendingCount,
    expiredCount,
    closedCount,
    typeCounts,
    riskCounts,
    weeklyPermits,
    recentActivityRows,
    expiringSoon,
  ] = await Promise.all([
    prisma.permit.count({ where: { status: "ACTIVE" } }),
    prisma.permit.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.permit.count({
      where: { status: "EXPIRED", updatedAt: { gte: oneDayAgo } },
    }),
    prisma.permit.count({ where: { status: "CLOSED" } }),
    prisma.permit.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: { status: { in: ["ACTIVE", "PENDING_APPROVAL", "APPROVED"] } },
    }),
    prisma.permit.groupBy({
      by: ["riskLevel"],
      _count: { _all: true },
      where: { riskLevel: { not: null } },
    }),
    prisma.permit.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.activityEntry.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        permit: { select: { permitNumber: true } },
      },
    }),
    prisma.permit.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 1000 * 60 * 60), // next hour
        },
      },
      select: { id: true },
    }),
  ]);

  // --- Stat cards -----------------------------------------------------
  const statCards: StatCard[] = [
    {
      label: "Active Permits",
      value: activeCount.toLocaleString(),
      icon: "bolt",
      tone: "primary",
    },
    {
      label: "Pending Approvals",
      value: pendingCount.toLocaleString(),
      icon: "pending_actions",
      tone: "secondary",
    },
    {
      label: "Expired Permits",
      value: String(expiredCount).padStart(2, "0"),
      icon: "history_toggle_off",
      tone: "error",
      caption: "Last 24h",
    },
    {
      label: "Closed Permits",
      value: closedCount.toLocaleString(),
      icon: "verified",
      tone: "tertiary",
    },
  ];

  // --- Permit type distribution ----------------------------------------
  const typeTotal = typeCounts.reduce((sum, t) => sum + t._count._all, 0);
  const permitTypeDistribution: PermitTypeSlice[] = typeCounts
    .map((t) => ({
      type: t.type,
      label: PERMIT_TYPE_LABELS[t.type],
      count: t._count._all,
      percent: typeTotal > 0 ? Math.round((t._count._all / typeTotal) * 100) : 0,
      color: PERMIT_TYPE_COLORS[t.type],
    }))
    .sort((a, b) => b.count - a.count);

  // --- Risk breakdown ---------------------------------------------------
  const riskOrder: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
  const riskTotal = riskCounts.reduce((sum, r) => sum + r._count._all, 0);
  const riskBreakdown: RiskBucket[] = riskOrder.map((level) => {
    const match = riskCounts.find((r) => r.riskLevel === level);
    const count = match?._count._all ?? 0;
    return {
      level,
      label: `${level} RISK`,
      count,
      percent: riskTotal > 0 ? Math.round((count / riskTotal) * 100) : 0,
    };
  });

  // --- Weekly trend (permits created per day, last 7 days) --------------
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.set(startOfDay(d).toISOString(), 0);
  }
  for (const p of weeklyPermits) {
    const key = startOfDay(p.createdAt).toISOString();
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  const weeklyTrend: TrendPoint[] = Array.from(buckets.entries()).map(
    ([iso, count]) => ({
      day: dayLabels[new Date(iso).getDay()],
      count,
    }),
  );

  // --- Recent activity ----------------------------------------------------
  const recentActivity: ActivityFeedEntry[] = recentActivityRows.map((row) => {
    let kind: ActivityFeedEntry["kind"] = "comment";
    const msg = row.message.toLowerCase();
    if (row.type === "STATUS_CHANGE") {
      if (msg.includes("approved")) kind = "approved";
      else if (msg.includes("rejected")) kind = "rejected";
      else if (msg.includes("closed")) kind = "closed";
      else kind = "updated";
    } else if (row.type === "SYSTEM_UPDATE") {
      kind = "updated";
    }
    return {
      id: row.id,
      message: row.message,
      permitNumber: row.permit?.permitNumber ?? null,
      authorName: row.author?.name ?? null,
      createdAt: row.createdAt,
      kind,
    };
  });

  // --- Alerts -------------------------------------------------------------
  const alerts: DashboardData["alerts"] = [];
  if (expiringSoon.length > 0) {
    alerts.push({
      id: "expiring-soon",
      title: "Urgent Action Required",
      message: `${expiringSoon.length} permit${expiringSoon.length === 1 ? "" : "s"} expiring within the hour`,
      tone: "error",
      icon: "warning",
    });
  }
  if (pendingCount > 0) {
    alerts.push({
      id: "pending-approvals",
      title: "Approvals Waiting",
      message: `${pendingCount} permit${pendingCount === 1 ? "" : "s"} pending review`,
      tone: "primary",
      icon: "approval",
    });
  }
  alerts.push({
    id: "system-update",
    title: "System Update",
    message: "Maintenance scheduled for 22:00 EAT",
    tone: "neutral",
    icon: "info",
  });

  return {
    statCards,
    permitTypeDistribution,
    riskBreakdown,
    weeklyTrend,
    recentActivity,
    alerts,
  };
}
