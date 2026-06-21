import Link from "next/link";
import { notFound } from "next/navigation";
import { getPermitDetail } from "@/lib/queries/permit-detail";
import { requireUser } from "@/lib/session";
import { ActivityLogThread } from "@/components/permits/activity-log-thread";
import {
  PERMIT_TYPE_LABELS,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_STYLES,
} from "@/lib/config/permit-display";
import type { ApprovalStep, Hazard, Attachment, User } from "@prisma/client";

type ApprovalStepWithApprover = ApprovalStep & {
  approver: Pick<User, "name"> | null;
};
type AttachmentWithUploader = Attachment & {
  uploadedBy: Pick<User, "name"> | null;
};

const HAZARD_ICON_BY_CATEGORY: Record<string, string> = {
  "Fire & Explosion": "local_fire_department",
  "Toxic Gas / H2S": "gas_meter",
  "Working at Height": "height",
  "Pressure Systems": "speed",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const permit = await getPermitDetail(id);

  if (!permit) notFound();

  const isLive = permit.status === "ACTIVE" || permit.status === "APPROVED";

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile">
        <div className="flex items-center gap-4">
          <Link href="/permits" className="transition-transform active:scale-95">
            <span className="material-symbols-outlined text-primary">
              arrow_back
            </span>
          </Link>
          <h1 className="text-headline-sm font-bold text-primary">
            Permit #{permit.permitNumber}
          </h1>
        </div>
        {isLive && (
          <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            LIVE
          </span>
        )}
      </header>

      <main className="space-y-gutter p-margin-mobile">
        {/* Quick Info */}
        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-lg border border-outline-variant bg-white p-stack-md">
            <label className="mb-1 flex items-center gap-1 text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                engineering
              </span>
              WORK TYPE
            </label>
            <p className="text-headline-sm font-bold text-primary">
              {PERMIT_TYPE_LABELS[permit.type]}
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-white p-stack-md">
            <label className="mb-1 flex items-center gap-1 text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              LOCATION
            </label>
            <p className="text-label-lg text-on-surface">
              {permit.facilityName} — {permit.specificLocation}
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-white p-stack-md">
            <label className="mb-1 flex items-center gap-1 text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              VALIDITY
            </label>
            <p className="text-label-lg text-on-surface">
              {formatTime(permit.startDate)} - {formatTime(permit.endDate)}
            </p>
          </div>
        </section>

        {/* Status banner (replaces QR panel until Phase 9 verification module) */}
        <section
          className={`flex items-center gap-3 rounded-xl border-l-4 p-stack-md ${
            PERMIT_STATUS_STYLES[permit.status]
          } border-l-current`}
        >
          <span className="material-symbols-outlined">info</span>
          <div>
            <p className="text-label-lg font-bold">
              Status: {PERMIT_STATUS_LABELS[permit.status]}
            </p>
            <p className="text-body-sm opacity-90">
              QR verification arrives in a later phase.
            </p>
          </div>
        </section>

        {/* Permit Progress */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-label-lg font-bold text-primary">
            <span className="material-symbols-outlined">analytics</span>
            PERMIT PROGRESS
          </h2>
          <div className="space-y-6 rounded-lg border border-outline-variant bg-white p-stack-md">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <span className="material-symbols-outlined text-[14px]">
                    check
                  </span>
                </div>
                <div className="mt-1 h-full w-0.5 bg-primary" />
              </div>
              <div className="pb-2">
                <p className="text-label-lg text-primary">Draft Created</p>
                <p className="text-body-sm text-on-surface-variant">
                  {formatDateTime(permit.createdAt)}
                </p>
              </div>
            </div>

            {permit.submittedAt && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined text-[14px]">
                      check
                    </span>
                  </div>
                  <div className="mt-1 h-full w-0.5 bg-outline-variant" />
                </div>
                <div className="pb-2">
                  <p className="text-label-lg text-primary">Submitted</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatDateTime(permit.submittedAt)}
                  </p>
                </div>
              </div>
            )}

            {permit.approvalSteps.map((step: ApprovalStepWithApprover) => {
              const isApproved = step.status === "APPROVED";
              const isRejected = step.status === "REJECTED";
              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isApproved
                          ? "bg-primary text-white"
                          : isRejected
                            ? "bg-error text-white"
                            : "border-2 border-secondary bg-secondary-fixed text-on-secondary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isApproved ? "check" : isRejected ? "close" : "pending"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-label-lg font-bold ${
                        isApproved
                          ? "text-primary"
                          : isRejected
                            ? "text-error"
                            : "text-secondary"
                      }`}
                    >
                      {step.requiredRole.replace("_", " ")}{" "}
                      {isApproved
                        ? "Approved"
                        : isRejected
                          ? "Rejected"
                          : "Pending"}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {step.approver?.name ?? "Awaiting assignment"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Hazard Assessment */}
        {permit.riskAssessment && permit.riskAssessment.hazards.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-label-lg font-bold text-primary">
                <span className="material-symbols-outlined">warning</span>
                HAZARD ASSESSMENT
              </h2>
              <Link
                href={`/risk-assessments/${permit.id}`}
                className="flex items-center gap-1 text-label-sm font-bold text-primary hover:underline"
              >
                Full Risk Assessment
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto">
              {permit.riskAssessment.hazards.map((hazard: Hazard) => (
                <div
                  key={hazard.id}
                  className="min-w-[140px] rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <span
                    className="material-symbols-outlined mb-2 text-red-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {HAZARD_ICON_BY_CATEGORY[hazard.category] ?? "warning"}
                  </span>
                  <p className="text-label-md font-bold text-red-900">
                    {hazard.category}
                  </p>
                  <p className="text-[10px] text-red-700">
                    {hazard.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Signatories */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-label-lg font-bold text-primary">
            <span className="material-symbols-outlined">groups</span>
            SIGNATORIES
          </h2>
          <div className="divide-y divide-outline-variant/30 rounded-lg border border-outline-variant bg-white">
            {permit.approvalSteps.map((step: ApprovalStepWithApprover) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-stack-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
                    {step.approver?.name
                      ?.split(" ")
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join("") ?? "?"}
                  </div>
                  <div>
                    <p className="text-label-lg">
                      {step.approver?.name ?? "Unassigned"}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {step.requiredRole.replace("_", " ")}
                    </p>
                  </div>
                </div>
                {step.status === "APPROVED" ? (
                  <span className="flex items-center gap-1 text-[12px] font-bold text-green-600">
                    <span className="material-symbols-outlined text-[16px]">
                      verified
                    </span>
                    Approved
                  </span>
                ) : step.status === "REJECTED" ? (
                  <span className="flex items-center gap-1 text-[12px] font-bold text-error">
                    <span className="material-symbols-outlined text-[16px]">
                      cancel
                    </span>
                    Rejected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] font-bold text-secondary">
                    <span className="material-symbols-outlined animate-pulse text-[16px]">
                      hourglass_top
                    </span>
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Attachments */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-label-lg font-bold text-primary">
            <span className="material-symbols-outlined">attachment</span>
            ATTACHMENTS
          </h2>
          {permit.attachments.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No files attached.
            </p>
          ) : (
            <div className="space-y-2">
              {permit.attachments.map((file: AttachmentWithUploader) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-outline-variant bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">
                      {file.mimeType.includes("pdf")
                        ? "picture_as_pdf"
                        : "image"}
                    </span>
                    <div>
                      <p className="text-label-md">{file.fileName}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {(file.fileSize / (1024 * 1024)).toFixed(1)} MB
                        {file.uploadedBy ? ` • ${file.uploadedBy.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 transition-colors hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-primary">
                      download
                    </span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <ActivityLogThread
          permitId={permit.id}
          entries={permit.activityEntries}
          currentUserId={user.id}
        />
      </main>
    </div>
  );
}
