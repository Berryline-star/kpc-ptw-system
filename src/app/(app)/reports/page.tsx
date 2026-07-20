import { getReportsData } from "@/lib/queries/reports";
import { StatCardsGrid } from "@/components/dashboard/stat-cards";
import { PermitTypeDonut } from "@/components/dashboard/permit-type-donut";
import { RiskCategoryAnalysis } from "@/components/dashboard/risk-category-analysis";
import { MonthlyTrendChart } from "@/components/reports/monthly-trend-chart";
import { DepartmentLeaderboard } from "@/components/reports/department-leaderboard";
import type { StatCard } from "@/lib/queries/dashboard";

export default async function ReportsPage() {
  const data = await getReportsData();

  const statCards: StatCard[] = [
    {
      label: "Total Permits (All Time)",
      value: data.totalPermitsAllTime.toLocaleString(),
      icon: "folder_copy",
      tone: "primary",
    },
    {
      label: "Approval Rate",
      value: `${data.approvalRatePercent}%`,
      icon: "fact_check",
      tone: "secondary",
    },
    {
      label: "Avg. Approval Time",
      value:
        data.avgApprovalHours === null
          ? "—"
          : data.avgApprovalHours < 1
            ? `${Math.round(data.avgApprovalHours * 60)} min`
            : `${data.avgApprovalHours} hrs`,
      icon: "timer",
      tone: "tertiary",
      caption: "Creation → final approval",
    },
    {
      label: "High-Risk Active Permits",
      value: data.highRiskActivePermits.toLocaleString(),
      icon: "warning",
      tone: "error",
    },
  ];

  const typeTotal = data.permitTypeDistribution.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  return (
    <div className="bg-background p-margin-mobile md:p-margin-desktop">
      <h2 className="mb-stack-lg text-headline-sm font-black uppercase tracking-tight text-primary">
        Reporting &amp; Analytics
      </h2>

      <div className="mb-stack-lg">
        <StatCardsGrid cards={statCards} />
      </div>

      <div className="mb-stack-lg grid grid-cols-12 gap-gutter">
        <MonthlyTrendChart points={data.monthlyTrend} />
        <PermitTypeDonut
          slices={data.permitTypeDistribution}
          total={typeTotal}
        />
      </div>

      <RiskCategoryAnalysis buckets={data.riskBreakdown} />

      <DepartmentLeaderboard stats={data.departmentStats} />
    </div>
  );
}
