import { cn } from "@/lib/utils";
import type { RiskBucket } from "@/lib/queries/dashboard";

const RISK_STYLES: Record<RiskBucket["level"], { label: string; bar: string }> = {
  HIGH: { label: "text-error", bar: "bg-error" },
  MEDIUM: { label: "text-secondary", bar: "bg-secondary" },
  LOW: { label: "text-primary", bar: "bg-primary" },
};

export function RiskCategoryAnalysis({ buckets }: { buckets: RiskBucket[] }) {
  return (
    <div className="mb-stack-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
      <h4 className="mb-stack-md text-label-lg font-bold uppercase tracking-wider text-on-surface">
        Risk Category Analysis
      </h4>
      <div className="space-y-4">
        {buckets.map((bucket) => {
          const style = RISK_STYLES[bucket.level];
          return (
            <div key={bucket.level}>
              <div className="mb-1 flex justify-between text-label-sm">
                <span className={cn("font-bold", style.label)}>
                  {bucket.label}
                </span>
                <span>
                  {bucket.count} Permit{bucket.count === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={cn("h-full", style.bar)}
                  style={{ width: `${bucket.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
