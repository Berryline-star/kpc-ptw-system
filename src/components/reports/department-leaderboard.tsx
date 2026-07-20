import { cn } from "@/lib/utils";
import type { DepartmentStat } from "@/lib/queries/reports";

export function DepartmentLeaderboard({ stats }: { stats: DepartmentStat[] }) {
  return (
    <div className="border border-outline-variant bg-surface-container-lowest p-stack-md">
      <h4 className="mb-stack-md text-label-lg font-bold uppercase tracking-wider text-on-surface">
        Contractor / Department Performance
      </h4>

      {stats.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No department data yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-outline-variant text-left text-label-sm uppercase text-on-surface-variant">
                <th className="py-2 pr-stack-md font-bold">Department</th>
                <th className="py-2 pr-stack-md font-bold">Total Permits</th>
                <th className="py-2 pr-stack-md font-bold">Approved</th>
                <th className="py-2 pr-stack-md font-bold">Rejected</th>
                <th className="py-2 font-bold">Approval Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr
                  key={row.department}
                  className="border-b border-outline-variant text-body-sm last:border-0"
                >
                  <td className="py-2 pr-stack-md font-bold text-on-surface">
                    {row.department}
                  </td>
                  <td className="py-2 pr-stack-md text-on-surface-variant">
                    {row.total}
                  </td>
                  <td className="py-2 pr-stack-md text-on-surface-variant">
                    {row.approved}
                  </td>
                  <td className="py-2 pr-stack-md text-on-surface-variant">
                    {row.rejected}
                  </td>
                  <td className="py-2">
                    <span
                      className={cn(
                        "font-bold",
                        row.approvalRate >= 80
                          ? "text-primary"
                          : row.approvalRate >= 50
                            ? "text-secondary"
                            : "text-error",
                      )}
                    >
                      {row.approved + row.rejected > 0
                        ? `${row.approvalRate}%`
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
