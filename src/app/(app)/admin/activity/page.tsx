import { getAuditLogs, getAuditActionMeta } from "@/lib/queries/audit-log";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function describeMetadata(action: string, metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const meta = metadata as Record<string, unknown>;

  if (action === "ROLE_CHANGED" && meta.from && meta.to) {
    return `${meta.from} → ${meta.to}`;
  }
  if (action === "PERMISSION_UPDATED" && meta.field !== undefined) {
    return `${meta.field}: ${meta.value ? "granted" : "revoked"}`;
  }
  return null;
}

export default async function ActivityLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      {logs.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          No activity recorded yet. Actions like role changes and
          permission updates will show up here.
        </p>
      ) : (
        <div className="border border-outline-variant bg-surface">
          {logs.map((log) => {
            const meta = getAuditActionMeta(log.action);
            const detail = describeMetadata(log.action, log.metadata);

            return (
              <div
                key={log.id}
                className="flex gap-stack-md border-b border-outline-variant p-stack-md last:border-0"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    {meta.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-label-lg font-bold text-on-surface">
                      {meta.label}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {log.actor
                      ? `${log.actor.name} (${log.actor.email})`
                      : "System"}{" "}
                    &middot; {log.targetType} {log.targetId}
                  </p>
                  {detail && (
                    <p className="mt-1 text-label-sm text-on-surface-variant opacity-80">
                      {detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
