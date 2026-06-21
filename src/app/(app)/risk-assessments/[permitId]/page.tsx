import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getRiskAssessmentByPermitId } from "@/lib/queries/risk-assessment";
import { RiskMatrixGrid } from "@/components/risk-assessment/risk-matrix-grid";
import { HazardScoringTable } from "@/components/risk-assessment/hazard-scoring-table";
import { ControlMeasuresChecklist } from "@/components/risk-assessment/control-measures-checklist";
import { SignAssessmentButton } from "@/components/risk-assessment/sign-assessment-button";

const OVERALL_LEVEL_STYLES: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-secondary",
  HIGH: "text-error",
};

const OVERALL_LEVEL_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

// Only these roles can adjust hazard scores / toggle control measures /
// sign off — everyone else (e.g. Contractor) gets a read-only view.
const CAN_EDIT_ROLES = ["SYSTEM_ADMIN", "SAFETY_OFFICER", "DEPOT_MANAGER"];

export default async function RiskAssessmentDetailPage({
  params,
}: {
  params: Promise<{ permitId: string }>;
}) {
  const user = await requireUser();
  const { permitId } = await params;

  const assessment = await getRiskAssessmentByPermitId(permitId);
  if (!assessment) notFound();

  const canEdit =
    CAN_EDIT_ROLES.includes(user.role) && assessment.status !== "VERIFIED";

  // Matrix marker shows the highest-scoring hazard's L/S position.
  const sortedByScore = [...assessment.hazards].sort(
    (a, b) => b.riskScore - a.riskScore,
  );
  const topHazard = sortedByScore[0] ?? null;

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-primary px-margin-mobile text-on-primary md:px-margin-desktop">
        <div className="flex items-center gap-3">
          <Link
            href={`/permits/${permitId}`}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary-container/20"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-headline-sm">
            Risk Assessment — {assessment.permit.permitNumber}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-screen-max space-y-stack-md px-margin-mobile py-stack-md md:px-margin-desktop">
        <section className="flex items-center justify-between border-l-4 border-secondary bg-surface-container-high p-4">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {assessment.status === "VERIFIED"
                ? "verified"
                : "pending_actions"}
            </span>
            <div>
              <p className="text-label-lg text-on-surface">
                Verification Status
              </p>
              <p className="text-body-sm font-bold uppercase tracking-wider text-on-surface-variant">
                {assessment.status === "VERIFIED"
                  ? "Verified"
                  : "Pending Review"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          <div className="flex h-full flex-col justify-between border border-outline-variant bg-surface-container-lowest p-stack-md md:col-span-1">
            <div>
              <h3 className="mb-2 text-label-md uppercase text-on-surface-variant">
                Overall Risk Rating
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-display-lg ${OVERALL_LEVEL_STYLES[assessment.overallLevel]}`}
                >
                  {OVERALL_LEVEL_LABELS[assessment.overallLevel]}
                </span>
                <span className="text-headline-sm text-on-surface-variant">
                  / 25
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary-fixed p-3">
              <div className="h-4 w-4 shrink-0 rounded-full bg-secondary-container shadow-sm" />
              <p className="text-body-sm text-on-secondary-fixed-variant">
                {assessment.overallLevel === "HIGH"
                  ? "Elevated risk. Verify all controls before work begins."
                  : "Operational caution required. Ensure all control measures are active."}
              </p>
            </div>
          </div>

          <div className="border border-outline-variant bg-surface-container-lowest p-stack-md md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-label-md uppercase text-on-surface-variant">
                Risk Matrix (L x S)
              </h3>
              <span className="text-label-sm text-outline">
                Industrial Standard 5x5
              </span>
            </div>
            <RiskMatrixGrid
              likelihood={topHazard?.likelihood ?? 1}
              severity={topHazard?.severity ?? 1}
            />
          </div>
        </section>

        <HazardScoringTable hazards={assessment.hazards} readOnly={!canEdit} />

        <ControlMeasuresChecklist
          measures={assessment.controlMeasures}
          readOnly={!canEdit}
        />

        {canEdit && (
          <SignAssessmentButton
            riskAssessmentId={assessment.id}
            alreadySigned={assessment.status === "VERIFIED"}
          />
        )}
      </main>
    </div>
  );
}
