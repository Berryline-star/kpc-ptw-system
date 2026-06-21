"use client";

import { useEffect, useState } from "react";
import { usePermitWizard } from "./permit-wizard-context";
import { WizardStepper } from "./wizard-stepper";
import { WizardBottomBar } from "./wizard-chrome";
import { step3Schema } from "@/lib/validation/permit";
import { getSupervisorOptions } from "@/lib/actions/permit-lookups";

interface SupervisorOption {
  id: string;
  name: string;
  department: string | null;
}

export function Step3ContractorFiles() {
  const { data, updateData, nextStep, prevStep } = usePermitWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);

  useEffect(() => {
    getSupervisorOptions()
      .then(setSupervisors)
      .finally(() => setLoadingSupervisors(false));
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      updateData({ files: [...data.files, ...Array.from(e.target.files)] });
    }
  }

  function removeFile(index: number) {
    updateData({ files: data.files.filter((_, i) => i !== index) });
  }

  function handleNext() {
    const result = step3Schema.safeParse({
      contractorName: data.contractorName,
      contractorIdNumber: data.contractorIdNumber,
      supervisorId: data.supervisorId,
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
    nextStep();
  }

  return (
    <>
      <main className="mx-auto min-h-screen max-w-md px-margin-mobile pb-24 pt-14">
        <div className="py-stack-lg">
          <WizardStepper currentStep={3} />
        </div>

        <div className="space-y-stack-lg">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
            <h2 className="mb-4 text-headline-sm text-primary">
              Contractor Assignment
            </h2>
            <div className="space-y-stack-md">
              <div className="flex flex-col gap-2">
                <label className="px-1 text-label-lg text-on-surface-variant">
                  Contractor Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Pipeline Solutions Ltd"
                    value={data.contractorName}
                    onChange={(e) =>
                      updateData({ contractorName: e.target.value })
                    }
                    className="h-12 w-full rounded-lg border border-outline bg-surface px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-3 text-on-surface-variant">
                    business
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="px-1 text-label-lg text-on-surface-variant">
                  Contractor ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="KPC-CONT-XXXXX"
                    value={data.contractorIdNumber}
                    onChange={(e) =>
                      updateData({ contractorIdNumber: e.target.value })
                    }
                    className="h-12 w-full rounded-lg border border-outline bg-surface px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-3 text-on-surface-variant">
                    badge
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="px-1 text-label-lg text-on-surface-variant">
                  Supervisor In-Charge
                </label>
                <div className="relative">
                  <select
                    value={data.supervisorId}
                    onChange={(e) =>
                      updateData({ supervisorId: e.target.value })
                    }
                    disabled={loadingSupervisors}
                    className="h-12 w-full appearance-none rounded-lg border border-outline bg-surface px-4 pr-10 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">
                      {loadingSupervisors
                        ? "Loading supervisors..."
                        : "Select a supervisor"}
                    </option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.department ? ` — ${s.department}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-3 text-on-surface-variant">
                    person_search
                  </span>
                </div>
                {errors.supervisorId && (
                  <p className="px-1 text-label-sm text-error">
                    {errors.supervisorId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm text-primary">
                Work Plan &amp; JHA
              </h2>
              <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm font-bold text-on-surface-variant">
                OPTIONAL
              </span>
            </div>

            <label
              htmlFor="file-input"
              className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant bg-surface p-8 transition-all hover:bg-surface-container-high"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined !text-4xl">
                  upload_file
                </span>
              </div>
              <div className="text-center">
                <p className="text-label-lg text-on-surface">
                  Tap to upload files
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  PDF, DOCX, or JPG (Max 25MB)
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {data.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-high p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        description
                      </span>
                      <div>
                        <p className="max-w-[180px] truncate text-label-lg text-on-surface">
                          {file.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                      className="rounded-full p-1 text-error transition-colors hover:bg-error-container"
                    >
                      <span className="material-symbols-outlined">
                        delete
                      </span>
                    </button>
                  </div>
                ))}
                <p className="px-1 text-label-sm text-on-surface-variant">
                  Files will upload once you submit the permit on the final
                  step.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <WizardBottomBar>
        <button
          type="button"
          onClick={prevStep}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary font-bold text-primary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-lg bg-primary font-bold text-on-primary shadow-md transition-all active:scale-95"
        >
          Next Step
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </WizardBottomBar>
    </>
  );
}
