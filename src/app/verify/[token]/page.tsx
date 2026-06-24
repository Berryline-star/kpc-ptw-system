import Link from "next/link";
import { getPermitByVerificationToken } from "@/lib/queries/verification";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  HOT_WORK: "Hot Work",
  COLD_WORK: "Cold Work",
  CONFINED_SPACE: "Confined Space",
  EXCAVATION: "Excavation",
  WORKING_AT_HEIGHT: "Working at Height",
  ELECTRICAL: "Electrical",
};

function formatExpiry(endDate: Date): string {
  const diffMs = endDate.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

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

// "Valid" means the permit is both administratively APPROVED/ACTIVE and
// currently within its scheduled work window — a permit can be approved
// but not yet started, or approved but past its end time, neither of
// which should read as a green light to a field inspector.
function isCurrentlyValid(
  status: string,
  startDate: Date,
  endDate: Date,
): boolean {
  const now = new Date();
  return (
    (status === "APPROVED" || status === "ACTIVE") &&
    now >= startDate &&
    now <= endDate
  );
}

export default async function VerifyPermitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const permit = await getPermitByVerificationToken(token);

  if (!permit) {
    return (
      <div className="min-h-dvh bg-background">
        <header className="fixed top-0 z-50 flex h-14 w-full items-center bg-primary px-margin-mobile text-on-primary">
          <h1 className="text-headline-sm-mobile font-bold">
            Permit Verification
          </h1>
        </header>
        <main className="mx-auto max-w-lg px-margin-mobile pt-24 text-center">
          <div className="rounded-lg border border-outline-variant bg-white p-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-error">
              <span
                className="material-symbols-outlined text-5xl text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
            </div>
            <h2 className="text-display-lg uppercase tracking-widest text-error">
              Invalid
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              This QR code doesn&apos;t match any permit in the system. It
              may have been mistyped, tampered with, or the permit may have
              been deleted.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const valid = isCurrentlyValid(
    permit.status,
    permit.startDate,
    permit.endDate,
  );
  const topHazard = permit.riskAssessment?.hazards[0];

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between bg-primary px-margin-mobile text-on-primary">
        <h1 className="text-headline-sm-mobile font-bold">
          Permit Verification
        </h1>
        <a
          href="tel:0800123456"
          aria-label="Emergency contact"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary-container/20"
        >
          <span className="material-symbols-outlined">emergency_home</span>
        </a>
      </header>

      <main className="mx-auto max-w-lg px-margin-mobile pt-20">
        <div className="mb-gutter overflow-hidden rounded-lg border border-outline-variant bg-white">
          <div
            className={`p-8 text-center ${valid ? "bg-green-600" : "bg-error"}`}
          >
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <span
                className="material-symbols-outlined text-5xl text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {valid ? "check_circle" : "cancel"}
              </span>
            </div>
            <h2 className="text-display-lg uppercase tracking-widest text-white">
              {valid ? "Valid" : "Not Active"}
            </h2>
            <p className="mt-2 text-label-md uppercase tracking-widest text-white/80">
              {valid
                ? "Permit to Work Active"
                : `Status: ${permit.status.replace("_", " ")}`}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low p-4">
            <span className="text-label-md text-on-surface-variant">
              Verified: Just Now
            </span>
            <span className="text-label-md text-on-surface-variant">
              {valid
                ? `Expires in: ${formatExpiry(permit.endDate)}`
                : `Until: ${formatDateTime(permit.endDate)}`}
            </span>
          </div>
        </div>

        <div className="mb-gutter grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-white p-4">
            <div className="rounded-lg bg-primary-container/10 p-3">
              <span className="material-symbols-outlined text-2xl text-primary">
                assignment
              </span>
            </div>
            <div>
              <p className="text-label-sm uppercase tracking-tighter text-on-surface-variant">
                Permit Identifier
              </p>
              <p className="text-headline-sm text-primary">
                {permit.permitNumber}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-white p-4">
            <div className="rounded-lg bg-secondary-container/10 p-3">
              <span className="material-symbols-outlined text-2xl text-secondary">
                construction
              </span>
            </div>
            <div>
              <p className="text-label-sm uppercase tracking-tighter text-on-surface-variant">
                Work Category
              </p>
              <p className="text-headline-sm">
                {PERMIT_TYPE_LABELS[permit.type] ?? permit.type}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-white p-4">
            <div className="rounded-lg bg-tertiary-container/10 p-3">
              <span className="material-symbols-outlined text-2xl text-tertiary">
                location_on
              </span>
            </div>
            <div>
              <p className="text-label-sm uppercase tracking-tighter text-on-surface-variant">
                Facility Location
              </p>
              <p className="text-headline-sm">
                {permit.facilityName} — {permit.specificLocation}
              </p>
            </div>
          </div>
        </div>

        {permit.riskAssessment && (
          <div className="mb-gutter rounded-lg border border-outline-variant bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">
                warning
              </span>
              <h3 className="text-headline-sm">Risk Assessment</h3>
            </div>
            <div className="space-y-4">
              {topHazard && (
                <div className="rounded-lg border-l-4 border-secondary bg-surface-container p-3">
                  <p className="mb-1 text-label-lg text-on-surface">
                    {topHazard.category}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {topHazard.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-outline-variant bg-surface-container-low p-3">
                  <p className="mb-1 text-label-sm text-on-surface-variant">
                    Risk Level
                  </p>
                  <p className="text-label-md font-bold">
                    {permit.riskLevel ?? "—"}
                  </p>
                </div>
                <div className="rounded border border-outline-variant bg-surface-container-low p-3">
                  <p className="mb-1 text-label-sm text-on-surface-variant">
                    Required PPE
                  </p>
                  <p className="text-label-md">
                    {permit.riskAssessment.requiredPPE.length > 0
                      ? permit.riskAssessment.requiredPPE.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href={`/permits/${permit.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-label-lg text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          >
            <span className="material-symbols-outlined">visibility</span>
            View Full Permit Documentation
          </Link>
          <p className="text-center text-label-sm text-on-surface-variant">
            (Requires sign-in for full documentation and to flag a
            violation.)
          </p>
        </div>
      </main>
    </div>
  );
}
