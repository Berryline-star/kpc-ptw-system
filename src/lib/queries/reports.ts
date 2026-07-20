import { prisma } from "@/lib/prisma";
import type {
  PermitTypeSlice,
  RiskBucket,
  TrendPoint,
} from "@/lib/queries/dashboard";
import type { PermitType, RiskLevel } from "@prisma/client";

const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  HOT_WORK: "Hot Work",
  COLD_WORK: "Cold Work",
  CONFINED_SPACE: "Confined Space",
  EXCAVATION: "Excavation",
  WORKING_AT_HEIGHT: "Working at Height",
  ELECTRICAL: "Electrical",
};

const PERMIT_TYPE_COLORS: Record<PermitType, string> = {
  HOT_WORK: "#00366e",
  COLD_WORK: "#fe6500",
  CONFINED_SPACE: "#a33e00",
  EXCAVATION: "#737782",
  WORKING_AT_HEIGHT: "#245eaa",
  ELECTRICAL: "#9bbfff",
};

export interface DepartmentStat {
  department: string;
  total: number;
  approved: number;
  rejected: number;
  approvalRate: number; // percent, of permits that reached a final decision
}

export interface ReportsData {
  totalPermitsAllTime: number;
  approvalRatePercent: number;
  avgApprovalHours: number | null;
  highRiskActivePermits: number;
  monthlyTrend: TrendPoint[];
  permitTypeDistribution: PermitTypeSlice[];
  riskBreakdown: RiskBucket[];
  departmentStats: DepartmentStat[];
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getReportsData(): Promise<ReportsData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29); // inclusive of today = 30 points

  const [
    totalPermitsAllTime,
    approvedCount,
    rejectedCount,
    highRiskActive,
    typeCounts,
    riskCounts,
    monthlyPermits,
    decidedPermits,
    permitsByDepartment,
  ] = await Promise.all([
    prisma.permit.count(),
    prisma.permit.count({
      where: { status: { in: ["APPROVED", "ACTIVE", "CLOSED"] } },
    }),
    prisma.permit.count({ where: { status: "REJECTED" } }),
    prisma.permit.count({
      where: { status: { in: ["ACTIVE", "APPROVED"] }, riskLevel: "HIGH" },
    }),
    prisma.permit.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.permit.groupBy({
      by: ["riskLevel"],
      _count: { _all: true },
      where: { riskLevel: { not: null } },
    }),
    prisma.permit.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    // For average approval time: permits that reached a final decision,
    // with their creation time and their last approval step's signedAt.
    prisma.permit.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE", "CLOSED"] },
      },
      select: {
        createdAt: true,
        approvalSteps: {
          where: { status: "APPROVED" },
          orderBy: { sequence: "desc" },
          take: 1,
          select: { signedAt: true },
        },
      },
    }),
    prisma.permit.groupBy({
      by: ["department"],
      _count: { _all: true },
      where: { department: { not: null } },
    }),
  ]);

  const decidedTotal = approvedCount + rejectedCount;
  const approvalRatePercent =
    decidedTotal > 0 ? Math.round((approvedCount / decidedTotal) * 100) : 0;

  // --- Average approval time (creation -> final approval signature) ---
  const approvalDurationsMs = decidedPermits
    .map((p) => {
      const signedAt = p.approvalSteps[0]?.signedAt;
      if (!signedAt) return null;
      return signedAt.getTime() - p.createdAt.getTime();
    })
    .filter((ms): ms is number => ms !== null && ms >= 0);
  const avgApprovalHours =
    approvalDurationsMs.length > 0
      ? Math.round(
          (approvalDurationsMs.reduce((sum, ms) => sum + ms, 0) /
            approvalDurationsMs.length /
            (1000 * 60 * 60)) *
            10,
        ) / 10
      : null;

  // --- Type distribution (all-time, all statuses) ---
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

  // --- Risk breakdown (all-time) ---
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

  // --- 30-day trend ---
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.set(startOfDay(d).toISOString(), 0);
  }
  for (const p of monthlyPermits) {
    const key = startOfDay(p.createdAt).toISOString();
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  const monthlyTrend: TrendPoint[] = Array.from(buckets.entries()).map(
    ([iso, count]) => ({
      day: new Date(iso).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
      }),
      count,
    }),
  );

  // --- Department leaderboard (needs approved/rejected counts per dept,
  // which groupBy alone can't give us split by status in one call) ---
  const departmentNames = permitsByDepartment
    .map((d) => d.department)
    .filter((d): d is string => !!d);

  const [approvedByDept, rejectedByDept] = await Promise.all([
    prisma.permit.groupBy({
      by: ["department"],
      _count: { _all: true },
      where: {
        department: { in: departmentNames },
        status: { in: ["APPROVED", "ACTIVE", "CLOSED"] },
      },
    }),
    prisma.permit.groupBy({
      by: ["department"],
      _count: { _all: true },
      where: { department: { in: departmentNames }, status: "REJECTED" },
    }),
  ]);

  const departmentStats: DepartmentStat[] = permitsByDepartment
    .map((d) => {
      const department = d.department as string;
      const approved =
        approvedByDept.find((a) => a.department === department)?._count
          ._all ?? 0;
      const rejected =
        rejectedByDept.find((r) => r.department === department)?._count
          ._all ?? 0;
      const decided = approved + rejected;
      return {
        department,
        total: d._count._all,
        approved,
        rejected,
        approvalRate: decided > 0 ? Math.round((approved / decided) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    totalPermitsAllTime,
    approvalRatePercent,
    avgApprovalHours,
    highRiskActivePermits: highRiskActive,
    monthlyTrend,
    permitTypeDistribution,
    riskBreakdown,
    departmentStats,
  };
}
