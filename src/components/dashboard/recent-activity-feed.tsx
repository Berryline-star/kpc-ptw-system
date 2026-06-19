import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityFeedEntry } from "@/lib/queries/dashboard";

const KIND_STYLES: Record<
  ActivityFeedEntry["kind"],
  { icon: string; iconColor: string; iconBg: string }
> = {
  created: { icon: "add_circle", iconColor: "text-primary", iconBg: "bg-primary/10" },
  approved: {
    icon: "check_circle",
    iconColor: "text-green-700",
    iconBg: "bg-green-100",
  },
  rejected: { icon: "cancel", iconColor: "text-error", iconBg: "bg-error-container" },
  updated: {
    icon: "edit_square",
    iconColor: "text-secondary",
    iconBg: "bg-secondary-fixed",
  },
  closed: {
    icon: "task_alt",
    iconColor: "text-tertiary",
    iconBg: "bg-tertiary-fixed",
  },
  comment: {
    icon: "chat_bubble",
    iconColor: "text-on-surface-variant",
    iconBg: "bg-surface-container-high",
  },
};

export function RecentActivityFeed({
  entries,
}: {
  entries: ActivityFeedEntry[];
}) {
  return (
    <div className="col-span-12 border border-outline-variant bg-surface-container-lowest lg:col-span-8">
      <div className="flex items-center justify-between border-b border-outline-variant p-stack-md">
        <h4 className="text-label-lg font-bold uppercase tracking-wider text-on-surface">
          Recent Activities
        </h4>
        <Link
          href="/permits"
          className="text-label-md text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="p-stack-md text-body-sm text-on-surface-variant">
          No activity yet — actions on permits will show up here.
        </p>
      ) : (
        <div className="custom-scrollbar max-h-[400px] divide-y divide-outline-variant overflow-y-auto">
          {entries.map((entry) => {
            const style = KIND_STYLES[entry.kind];
            return (
              <div
                key={entry.id}
                className="flex gap-4 p-4 transition-colors hover:bg-surface-container-low"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    style.iconBg,
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined",
                      style.iconColor,
                    )}
                  >
                    {style.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-body-md font-medium text-on-surface">
                    {entry.permitNumber && (
                      <span className="text-primary">
                        #{entry.permitNumber}{" "}
                      </span>
                    )}
                    {entry.message}
                  </p>
                  {entry.authorName && (
                    <p className="text-label-sm text-on-surface-variant">
                      By {entry.authorName}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-label-sm text-on-surface-variant">
                  {formatRelativeTime(entry.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
