"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePermitWizard } from "./permit-wizard-context";
import { WizardStepper } from "./wizard-stepper";
import {
  HAZARD_OPTIONS,
  PPE_OPTIONS,
  PERMIT_TYPE_OPTIONS,
  step4Schema,
} from "@/lib/validation/permit";
import { createPermit } from "@/lib/actions/permit";
import { uploadPermitAttachment } from "@/lib/actions/attachments";
import { cn } from "@/lib/utils";

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "—";
  const startTime = new Date(start).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = new Date(end).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${startTime} - ${endTime}`;
}

export function Step4RiskReview() {
  const { data, updateData, prevStep, reset } = usePermitWizard();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const permitTypeLabel =
    PERMIT_TYPE_OPTIONS.find((o) => o.value === data.type)?.label ?? "—";

  function toggleHazard(key: string) {
    const next = data.selectedHazards.includes(key)
      ? data.selectedHazards.filter((h) => h !== key)
      : [...data.selectedHazards, key];
    updateData({ selectedHazards: next });
  }

  function togglePPE(key: string) {
    const next = data.selectedPPE.includes(key)
      ? data.selectedPPE.filter((p) => p !== key)
      : [...data.selectedPPE, key];
    updateData({ selectedPPE: next });
  }

  async function handleSubmit() {
    const result = step4Schema.safeParse({
      selectedHazards: data.selectedHazards,
      selectedPPE: data.selectedPPE,
      declarationAccepted: data.declarationAccepted,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    const response = await createPermit(data);

    if (!response.success || !response.permitId) {
      setSubmitError(response.message);
      setSubmitting(false);
      return;
    }

    // Upload any attached files now that we have a real permitId to
    // attach them to. Run sequentially rather than Promise.all so a
    // single failed upload doesn't abort the others mid-flight.
    if (data.files.length > 0) {
      for (const file of data.files) {
        const fileFormData = new FormData();
        fileFormData.set("file", file);
        fileFormData.set("category", "WORK_PLAN_JHA");
        const uploadResult = await uploadPermitAttachment(
          response.permitId,
          fileFormData,
        );
        if (!uploadResult.success) {
          // Permit was already created successfully — surface the upload
          // issue but still continue to the permit page rather than
          // blocking on it, since the permit itself is valid either way.
          console.error("Attachment upload failed:", uploadResult.message);
        }
      }
    }

    reset();
    router.push(`/permits/${response.permitId}`);
  }

  return (
    <>
      <main className="mx-auto max-w-md space-y-6 px-margin-mobile pb-32 pt-20">
        <WizardStepper currentStep={4} />

        <section className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-headline-sm text-primary">Permit Summary</h2>
            <span className="rounded bg-secondary-container px-2 py-1 text-label-sm font-bold uppercase tracking-wider text-on-secondary-container">
              Step 4/4
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-label-sm font-bold uppercase tracking-tight text-on-surface-variant">
                Work Type
              </p>
              <p className="text-body-md font-semibold">{permitTypeLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-label-sm font-bold uppercase tracking-tight text-on-surface-variant">
                Location
              </p>
              <p className="text-body-md font-semibold">
                {data.facilityName} — {data.specificLocation}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-label-sm font-bold uppercase tracking-tight text-on-surface-variant">
                Supervisor
              </p>
              <p className="text-body-md font-semibold">
                {data.supervisorId ? "Assigned" : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-label-sm font-bold uppercase tracking-tight text-on-surface-variant">
                Duration
              </p>
              <p className="text-body-md font-semibold">
                {formatDateRange(data.startDate, data.endDate)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-headline-sm">
            <span className="material-symbols-outlined text-secondary">
              warning
            </span>
            Hazard Assessment
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {HAZARD_OPTIONS.map((hazard) => (
              <label
                key={hazard.key}
                className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-4 transition-colors active:bg-surface-container-high"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {hazard.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-label-lg">{hazard.category}</span>
                    <span className="text-label-sm text-on-surface-variant">
                      {hazard.description}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={data.selectedHazards.includes(hazard.key)}
                  onChange={() => toggleHazard(hazard.key)}
                  className="h-6 w-6 rounded border-outline text-secondary focus:ring-secondary"
                />
              </label>
            ))}
          </div>
          {errors.selectedHazards && (
            <p className="text-label-sm text-error">
              {errors.selectedHazards}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-headline-sm">
            <span className="material-symbols-outlined text-primary">
              shield
            </span>
            Required PPE
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PPE_OPTIONS.map((ppe) => {
              const checked = data.selectedPPE.includes(ppe.key);
              return (
                <button
                  type="button"
                  key={ppe.key}
                  onClick={() => togglePPE(ppe.key)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border border-outline-variant p-4 transition-all",
                    checked && "bg-primary text-on-primary",
                  )}
                >
                  <span className="material-symbols-outlined mb-2 text-[32px]">
                    {ppe.icon}
                  </span>
                  <span className="text-label-md">{ppe.label}</span>
                </button>
              );
            })}
          </div>
          {errors.selectedPPE && (
            <p className="text-label-sm text-error">{errors.selectedPPE}</p>
          )}
        </section>

        <section className="space-y-4 rounded-xl border-l-4 border-secondary bg-surface-container p-5">
          <div className="flex items-start gap-4">
            <input
              id="declaration"
              type="checkbox"
              checked={data.declarationAccepted}
              onChange={(e) =>
                updateData({ declarationAccepted: e.target.checked })
              }
              className="mt-1 h-6 w-6 rounded border-outline text-secondary focus:ring-secondary"
            />
            <label
              htmlFor="declaration"
              className="text-body-sm text-on-surface-variant"
            >
              I hereby declare that I have personally inspected the site and
              verified that all safety measures and gas tests specified are
              in place. Work will only proceed as long as conditions remain
              safe.
            </label>
          </div>
          {errors.declarationAccepted && (
            <p className="text-label-sm text-error">
              {errors.declarationAccepted}
            </p>
          )}
        </section>

        {submitError && (
          <p
            role="alert"
            className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
          >
            {submitError}
          </p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden rounded-t-xl border-t border-outline-variant bg-surface shadow-lg">
        <div className="mx-auto max-w-md space-y-4 p-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-lg font-bold text-on-secondary-container shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  check_circle
                </span>
                Submit Permit for Approval
              </>
            )}
          </button>
          <button
            type="button"
            onClick={prevStep}
            disabled={submitting}
            className="flex h-10 w-full items-center justify-center gap-1 text-label-md text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
            Back to Contractor &amp; Files
          </button>
        </div>
      </div>
    </>
  );
}
