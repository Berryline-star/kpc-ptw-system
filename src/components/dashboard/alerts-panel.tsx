import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/queries/dashboard";

const TONE_STYLES: Record<
  DashboardData["alerts"][number]["tone"],
  { container: string; icon: string; title: string }
> = {
  error: {
    container: "bg-red-50 border-error",
    icon: "text-error",
    title: "text-error",
  },
  secondary: {
    container: "bg-secondary-fixed/30 border-secondary",
    icon: "text-secondary",
    title: "text-secondary",
  },
  primary: {
    container: "bg-primary-fixed/30 border-primary",
    icon: "text-primary",
    title: "text-primary",
  },
  neutral: {
    container: "border border-outline-variant",
    icon: "text-outline",
    title: "text-on-surface",
  },
};

export function AlertsPanel({
  alerts,
}: {
  alerts: DashboardData["alerts"];
}) {
  return (
    <div className="flex-1 border border-outline-variant bg-surface-container-lowest p-stack-md">
      <h4 className="mb-stack-md text-label-lg font-bold uppercase tracking-wider text-on-surface">
        Notifications &amp; Alerts
      </h4>
      <div className="space-y-stack-md">
        {alerts.map((alert) => {
          const style = TONE_STYLES[alert.tone];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex gap-3 p-3",
                alert.tone === "neutral"
                  ? style.container
                  : `border-l-4 ${style.container}`,
              )}
            >
              <span className={cn("material-symbols-outlined", style.icon)}>
                {alert.icon}
              </span>
              <div>
                <p className={cn("text-label-md font-bold", style.title)}>
                  {alert.title}
                </p>
                <p className="text-label-sm text-on-surface">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuickIssueCard() {
  return (
    <div className="flex items-center justify-between bg-primary p-stack-md">
      <div>
        <p className="text-label-lg font-bold text-on-primary">
          Ready to Issue?
        </p>
        <p className="text-label-sm text-on-primary/70">
          Start a new permit workflow
        </p>
      </div>
      <Link
        href="/permits/new"
        className="bg-secondary-container px-4 py-2 text-label-md font-bold text-on-secondary transition-all hover:brightness-110"
      >
        NEW PERMIT
      </Link>
    </div>
  );
}
