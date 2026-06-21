import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getApprovalQueue } from "@/lib/queries/approvals";
import {
  PERMIT_TYPE_LABELS,
  PERMIT_TYPE_TAG_STYLES,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_STYLES,
} from "@/lib/config/permit-display";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

export default async function ApprovalsPage() {
  const user = await requireUser();
  const queue = await getApprovalQueue(user.role);

  return (
    <div className="mx-auto max-w-screen-max p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Approval Queue
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          {queue.length > 0
            ? `${queue.length} permit${queue.length === 1 ? "" : "s"} waiting on your review as ${user.role.replace("_", " ").toLowerCase()}.`
            : "Nothing waiting on your review right now."}
        </p>
      </section>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-stack-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg py-stack-lg text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <span className="material-symbols-outlined text-[32px]">
              task_alt
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {queue.map((step) => (
            <Link
              key={step.id}
              href={`/approvals/${step.id}`}
              className="flex flex-col gap-stack-sm border border-outline-variant bg-surface-container-lowest p-stack-md transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-sm px-2 py-1 text-label-sm font-bold uppercase ${PERMIT_TYPE_TAG_STYLES[step.permit.type]}`}
                >
                  {PERMIT_TYPE_LABELS[step.permit.type]}
                </span>
                {step.permit.riskLevel && (
                  <span
                    className={`rounded-sm border px-2 py-1 text-label-sm font-bold uppercase ${RISK_LEVEL_STYLES[step.permit.riskLevel]}`}
                  >
                    {RISK_LEVEL_LABELS[step.permit.riskLevel]}
                  </span>
                )}
              </div>
              <p className="text-label-lg font-bold text-primary">
                #{step.permit.permitNumber}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {step.permit.facilityName} — {step.permit.specificLocation}
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-2 text-label-sm text-on-surface-variant">
                <span>By {step.permit.createdBy.name}</span>
                {step.permit.submittedAt && (
                  <span>Submitted {formatDate(step.permit.submittedAt)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
