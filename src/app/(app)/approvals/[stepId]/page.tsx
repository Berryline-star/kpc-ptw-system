import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getApprovalStepDetail } from "@/lib/queries/approvals";
import { ApprovalActionPanel } from "@/components/approvals/approval-action-panel";

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
    hour12: true,
  });
}

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ stepId: string }>;
}) {
  const user = await requireUser();
  const { stepId } = await params;

  const step = await getApprovalStepDetail(stepId);
  if (!step) notFound();

  // Not this user's role to action, or already actioned — bounce back to
  // the queue rather than showing a broken/unauthorized action panel.
  if (step.requiredRole !== user.role || step.status !== "PENDING") {
    redirect("/approvals");
  }

  const { permit } = step;

  return (
    <div className="pb-32">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-stack-md">
          <Link
            href="/approvals"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high active:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-primary">
              arrow_back
            </span>
          </Link>
          <h1 className="text-headline-sm text-primary">
            {permit.permitNumber}
          </h1>
        </div>
      </header>

      <main className="mx-auto mt-20 flex max-w-2xl flex-col gap-gutter px-margin-mobile">
        <section className="flex flex-col gap-stack-sm border border-outline-variant bg-surface-container-lowest p-stack-md">
          <div className="mb-2 flex items-center gap-stack-sm">
            <div className="h-6 w-1 bg-secondary" />
            <h2 className="text-label-lg uppercase tracking-wider text-on-surface-variant">
              Permit Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-stack-md">
            <div className="flex items-start justify-between border-b border-surface-container py-2">
              <span className="text-label-md text-outline">Work Type</span>
              <span className="text-right text-body-md font-semibold text-on-surface">
                {permit.type.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-start justify-between border-b border-surface-container py-2">
              <span className="text-label-md text-outline">Location</span>
              <span className="text-right text-body-md text-on-surface">
                {permit.facilityName} — {permit.specificLocation}
              </span>
            </div>
            <div className="flex items-start justify-between py-2">
              <span className="text-label-md text-outline">Supervisor</span>
              <span className="text-right text-body-md text-on-surface">
                {permit.supervisor?.name ?? "—"}
              </span>
            </div>
          </div>
        </section>

        {permit.riskAssessment && (
          <section className="border border-outline-variant bg-surface-container-lowest p-stack-md">
            <div className="mb-stack-md flex items-center justify-between">
              <div className="flex items-center gap-stack-sm">
                <div className="h-6 w-1 bg-secondary" />
                <h2 className="text-label-lg uppercase tracking-wider text-on-surface-variant">
                  Risk Assessment
                </h2>
              </div>
              {permit.riskAssessment.status === "VERIFIED" && (
                <span className="flex items-center gap-1 border border-primary-container/20 bg-primary-container/10 px-2 py-1 text-label-sm uppercase text-primary">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-col gap-stack-md">
              <div>
                <h3 className="mb-stack-sm text-label-md text-outline">
                  Identified Hazards
                </h3>
                <div className="flex flex-wrap gap-2">
                  {permit.riskAssessment.hazards.map((hazard) => (
                    <span
                      key={hazard.id}
                      className="flex items-center gap-1 rounded-sm border border-error/20 bg-error-container/20 px-3 py-1.5 text-body-sm text-error"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {HAZARD_ICON_BY_CATEGORY[hazard.category] ?? "warning"}
                      </span>
                      {hazard.category}
                    </span>
                  ))}
                </div>
              </div>
              {permit.riskAssessment.requiredPPE.length > 0 && (
                <div>
                  <h3 className="mb-stack-sm text-label-md text-outline">
                    Required PPE
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permit.riskAssessment.requiredPPE.map((ppe) => (
                      <span
                        key={ppe}
                        className="flex items-center gap-1 rounded-sm border border-outline-variant/30 bg-surface-container-high px-3 py-1.5 text-body-sm text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          engineering
                        </span>
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="border border-outline-variant bg-surface-container-lowest p-stack-md">
          <div className="mb-stack-md flex items-center gap-stack-sm">
            <div className="h-6 w-1 bg-secondary" />
            <h2 className="text-label-lg uppercase tracking-wider text-on-surface-variant">
              Approval Workflow
            </h2>
          </div>
          <div className="flex flex-col gap-stack-md">
            {permit.approvalSteps.map((s, i) => {
              const isLast = i === permit.approvalSteps.length - 1;
              const isApproved = s.status === "APPROVED";
              const isRejected = s.status === "REJECTED";
              return (
                <div
                  key={s.id}
                  className="relative flex items-center gap-stack-md"
                >
                  {!isLast && (
                    <div className="absolute bottom-[-16px] left-[11px] top-[24px] w-[2px] bg-outline-variant" />
                  )}
                  <div
                    className={`z-10 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                      isApproved
                        ? "bg-primary"
                        : isRejected
                          ? "bg-error"
                          : "border-2 border-outline-variant bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={
                        isApproved || isRejected
                          ? { fontVariationSettings: "'wght' 700" }
                          : undefined
                      }
                    >
                      {isApproved ? "check" : isRejected ? "close" : "pending"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-body-md font-semibold">
                      {s.requiredRole.replace("_", " ")}
                    </span>
                    <span
                      className={`text-label-sm font-bold uppercase ${
                        isApproved
                          ? "text-primary"
                          : isRejected
                            ? "text-error"
                            : "text-outline"
                      }`}
                    >
                      {isApproved
                        ? "Approved"
                        : isRejected
                          ? "Rejected"
                          : "Pending Approval"}
                    </span>
                  </div>
                  {s.signedAt && (
                    <span className="text-label-sm text-outline">
                      {formatTime(s.signedAt)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <ApprovalActionPanel
          stepId={step.id}
          signerName={user.name ?? "You"}
        />
      </main>
    </div>
  );
}
