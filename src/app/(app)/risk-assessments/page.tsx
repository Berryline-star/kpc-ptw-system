import Link from "next/link";
import {
  getRiskAssessmentsList,
} from "@/lib/queries/risk-assessment";
import {
  PERMIT_TYPE_LABELS,
  PERMIT_TYPE_TAG_STYLES,
} from "@/lib/config/permit-display";

type RiskAssessmentListItem = Awaited<
  ReturnType<typeof getRiskAssessmentsList>
>[number];

const STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
  VERIFIED: "bg-green-100 text-green-800",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  VERIFIED: "Verified",
};

export default async function RiskAssessmentsPage() {
  const assessments = await getRiskAssessmentsList();

  return (
    <div className="mx-auto max-w-screen-max p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Risk Assessments
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Industrial Standard 5x5 hazard scoring per permit.
        </p>
      </section>

      {assessments.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          No risk assessments yet — they&apos;re created automatically when a
          permit is submitted.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {assessments.map((assessment: RiskAssessmentListItem) => (
            <Link
              key={assessment.id}
              href={`/risk-assessments/${assessment.permit.id}`}
              className="flex flex-col gap-stack-sm border border-outline-variant bg-surface-container-lowest p-stack-md transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-sm px-2 py-1 text-label-sm font-bold uppercase ${PERMIT_TYPE_TAG_STYLES[assessment.permit.type]}`}
                >
                  {PERMIT_TYPE_LABELS[assessment.permit.type]}
                </span>
                <span
                  className={`rounded-sm px-2 py-1 text-label-sm font-bold uppercase ${STATUS_STYLES[assessment.status]}`}
                >
                  {STATUS_LABELS[assessment.status]}
                </span>
              </div>
              <p className="text-label-lg font-bold text-primary">
                #{assessment.permit.permitNumber}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {assessment.permit.facilityName} —{" "}
                {assessment.permit.specificLocation}
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-2 text-label-sm text-on-surface-variant">
                <span>{assessment.hazards.length} hazard(s)</span>
                <span>
                  Overall: {assessment.overallLevel} ({assessment.overallScore})
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
