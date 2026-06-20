import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { Hazard, ApprovalStep } from "@prisma/client";

export default async function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const permit = await prisma.permit.findUnique({
    where: { id },
    include: {
      riskAssessment: { include: { hazards: true } },
      approvalSteps: { orderBy: { sequence: "asc" } },
      createdBy: { select: { name: true } },
      supervisor: { select: { name: true } },
    },
  });

  if (!permit) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-stack-lg p-margin-mobile md:p-margin-desktop">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-md uppercase text-on-surface-variant">
            Phase 6 checkpoint
          </p>
          <h1 className="text-headline-md text-primary">
            Permit #{permit.permitNumber}
          </h1>
        </div>
        <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm font-bold text-on-secondary-container">
          {permit.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Work Type
          </p>
          <p className="text-body-md font-semibold">
            {permit.type.replace("_", " ")}
          </p>
        </div>
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Location
          </p>
          <p className="text-body-md font-semibold">
            {permit.facilityName} — {permit.specificLocation}
          </p>
        </div>
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Created By
          </p>
          <p className="text-body-md font-semibold">
            {permit.createdBy.name}
          </p>
        </div>
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Supervisor
          </p>
          <p className="text-body-md font-semibold">
            {permit.supervisor?.name ?? "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-label-sm uppercase text-on-surface-variant">
            Description
          </p>
          <p className="text-body-md">{permit.workDescription}</p>
        </div>
      </div>

      {permit.riskAssessment && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
          <p className="mb-2 text-label-lg font-bold text-on-surface">
            Risk Assessment — {permit.riskAssessment.overallLevel}
          </p>
          <ul className="space-y-1">
            {permit.riskAssessment.hazards.map((h: Hazard) => (
              <li key={h.id} className="text-body-sm text-on-surface-variant">
                {h.category}: {h.description} (score {h.riskScore})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
        <p className="mb-2 text-label-lg font-bold text-on-surface">
          Approval Chain
        </p>
        <ul className="space-y-1">
          {permit.approvalSteps.map((step: ApprovalStep) => (
            <li
              key={step.id}
              className="text-body-sm text-on-surface-variant"
            >
              {step.sequence}. {step.requiredRole.replace("_", " ")} —{" "}
              {step.status}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/permits"
        className="inline-flex items-center gap-1 text-label-lg text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to Permits
      </Link>
    </div>
  );
}
