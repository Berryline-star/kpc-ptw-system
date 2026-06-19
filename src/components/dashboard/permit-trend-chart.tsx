import type { TrendPoint } from "@/lib/queries/dashboard";

export function PermitTrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="col-span-12 border border-outline-variant bg-surface-container-lowest p-stack-md lg:col-span-7">
      <div className="mb-stack-md flex items-center justify-between">
        <h4 className="text-label-lg font-bold uppercase tracking-wider text-on-surface">
          Permit Trends
        </h4>
        <span className="rounded bg-surface-container-low px-2 py-1 text-label-sm text-on-surface-variant">
          Last 7 Days
        </span>
      </div>

      <div className="flex h-[240px] items-end justify-between gap-2 px-2">
        {points.map((point) => {
          const heightPercent = Math.max((point.count / max) * 100, 4);
          return (
            <div
              key={point.day}
              className="group relative w-full bg-primary/10"
              style={{ height: `${heightPercent}%` }}
              title={`${point.count} permit${point.count === 1 ? "" : "s"}`}
            >
              <div className="absolute bottom-0 h-[85%] w-full bg-primary opacity-80 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
      <div className="mt-stack-sm flex justify-between px-2 text-label-sm font-medium text-on-surface-variant">
        {points.map((point, i) => (
          <span key={`${point.day}-${i}`}>{point.day}</span>
        ))}
      </div>
    </div>
  );
}
