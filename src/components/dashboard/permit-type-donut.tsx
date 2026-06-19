import type { PermitTypeSlice } from "@/lib/queries/dashboard";

export function PermitTypeDonut({
  slices,
  total,
}: {
  slices: PermitTypeSlice[];
  total: number;
}) {
  // Build cumulative offsets so each arc starts where the previous ended.
  let cumulative = 0;
  const arcs = slices.map((slice) => {
    const offset = -cumulative;
    cumulative += slice.percent;
    return { ...slice, offset };
  });

  return (
    <div className="col-span-12 flex flex-col border border-outline-variant bg-surface-container-lowest p-stack-md lg:col-span-5">
      <h4 className="mb-stack-md text-label-lg font-bold uppercase tracking-wider text-on-surface">
        Permit Types Distribution
      </h4>
      <div className="flex flex-1 items-center justify-around gap-stack-md">
        {total === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            No active permits yet.
          </p>
        ) : (
          <>
            <div className="relative h-40 w-40 shrink-0">
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <circle
                  className="stroke-surface-container-high"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeWidth="4"
                />
                {arcs.map((arc) => (
                  <circle
                    key={arc.type}
                    cx="18"
                    cy="18"
                    fill="none"
                    r="16"
                    stroke={arc.color}
                    strokeDasharray={`${arc.percent}, 100`}
                    strokeDashoffset={arc.offset}
                    strokeWidth="4"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-sm font-bold text-primary">
                  {total}
                </span>
                <span className="text-[10px] uppercase text-on-surface-variant">
                  Total
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {slices.map((slice) => (
                <div
                  key={slice.type}
                  className="flex items-center gap-2 text-label-sm"
                >
                  <div
                    className="h-3 w-3 shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span>
                    {slice.label} ({slice.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
