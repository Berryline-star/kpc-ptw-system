import { requireUser } from "@/lib/session";
import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCardsGrid } from "@/components/dashboard/stat-cards";
import { PermitTrendChart } from "@/components/dashboard/permit-trend-chart";
import { PermitTypeDonut } from "@/components/dashboard/permit-type-donut";
import { RiskCategoryAnalysis } from "@/components/dashboard/risk-category-analysis";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import {
  AlertsPanel,
  QuickIssueCard,
} from "@/components/dashboard/alerts-panel";
import { CreatePermitFab } from "@/components/dashboard/create-permit-fab";

export default async function DashboardPage() {
  await requireUser();
  const data = await getDashboardData();
  const permitTypeTotal = data.permitTypeDistribution.reduce(
    (sum, slice) => sum + slice.count,
    0,
  );

  return (
    <div className="bg-background p-margin-mobile md:p-margin-desktop">
      <h2 className="mb-stack-lg text-headline-sm font-black uppercase tracking-tight text-primary">
        Dashboard Overview
      </h2>

      <div className="mb-stack-lg">
        <StatCardsGrid cards={data.statCards} />
      </div>

      <div className="mb-stack-lg grid grid-cols-12 gap-gutter">
        <PermitTrendChart points={data.weeklyTrend} />
        <PermitTypeDonut
          slices={data.permitTypeDistribution}
          total={permitTypeTotal}
        />
      </div>

      <RiskCategoryAnalysis buckets={data.riskBreakdown} />

      <div className="grid grid-cols-12 gap-gutter">
        <RecentActivityFeed entries={data.recentActivity} />
        <div className="col-span-12 flex flex-col gap-gutter lg:col-span-4">
          <AlertsPanel alerts={data.alerts} />
          <QuickIssueCard />
        </div>
      </div>

      <CreatePermitFab />
    </div>
  );
}
