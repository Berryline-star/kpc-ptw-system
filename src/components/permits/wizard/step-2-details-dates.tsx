"use client";

import { useState } from "react";
import { usePermitWizard } from "./permit-wizard-context";
import { WizardStepper } from "./wizard-stepper";
import { WizardBottomBar } from "./wizard-chrome";
import { step2Schema } from "@/lib/validation/permit";

const SUGGESTED_EQUIPMENT = [
  "Intrinsically Safe Flashlight",
  "Non-Sparking Hand Tools",
  "Gas Detector",
  "Fire Extinguisher",
];

export function Step2DetailsAndDates() {
  const { data, updateData, nextStep, prevStep } = usePermitWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [equipmentSearch, setEquipmentSearch] = useState("");

  const availableSuggestions = SUGGESTED_EQUIPMENT.filter(
    (item) =>
      !data.requiredEquipment.includes(item) &&
      item.toLowerCase().includes(equipmentSearch.toLowerCase()),
  );

  function addEquipment(item: string) {
    if (!item.trim() || data.requiredEquipment.includes(item)) return;
    updateData({ requiredEquipment: [...data.requiredEquipment, item] });
    setEquipmentSearch("");
  }

  function removeEquipment(item: string) {
    updateData({
      requiredEquipment: data.requiredEquipment.filter((e) => e !== item),
    });
  }

  function handleNext() {
    const result = step2Schema.safeParse({
      workDescription: data.workDescription,
      startDate: data.startDate,
      endDate: data.endDate,
      requiredEquipment: data.requiredEquipment,
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
      <main className="mx-auto max-w-md px-margin-mobile py-stack-lg pb-32 pt-20">
        <WizardStepper currentStep={2} />

        <div className="mb-stack-md">
          <h2 className="mb-1 text-headline-md text-primary">
            Work Description &amp; Timeline
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Specify the precise scope of work and the scheduled operational
            window.
          </p>
        </div>

        <div className="space-y-gutter">
          <div className="space-y-stack-sm">
            <label className="flex items-center gap-2 text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                description
              </span>
              Detailed Work Description
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Describe the exact task, tools to be used, and the pipeline section involved..."
                value={data.workDescription}
                onChange={(e) =>
                  updateData({ workDescription: e.target.value })
                }
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md text-body-md placeholder:text-outline/50 transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <div
                className={`absolute bottom-2 right-3 text-label-sm ${
                  data.workDescription.length > 450
                    ? "text-error"
                    : "text-outline"
                }`}
              >
                {data.workDescription.length} / 500
              </div>
            </div>
            {errors.workDescription && (
              <p className="px-1 text-label-sm text-error">
                {errors.workDescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-gutter">
            <div className="space-y-stack-sm">
              <label className="flex items-center gap-2 text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_today
                </span>
                Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={data.startDate}
                onChange={(e) => updateData({ startDate: e.target.value })}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-stack-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-stack-sm">
              <label className="flex items-center gap-2 text-label-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  event_busy
                </span>
                End Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={data.endDate}
                onChange={(e) => updateData({ endDate: e.target.value })}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-stack-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.endDate && (
                <p className="px-1 text-label-sm text-error">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-stack-sm">
            <label className="flex items-center gap-2 text-label-lg text-on-surface">
              <span className="material-symbols-outlined text-[18px]">
                handyman
              </span>
              Required Equipment &amp; Tools
            </label>
            <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-stack-md">
              {data.requiredEquipment.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {data.requiredEquipment.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full border-l-2 border-secondary bg-secondary-container px-3 py-1 text-label-md text-on-secondary-container"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(item)}
                        aria-label={`Remove ${item}`}
                        className="material-symbols-outlined cursor-pointer text-[14px]"
                      >
                        close
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and add equipment..."
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && equipmentSearch.trim()) {
                      e.preventDefault();
                      addEquipment(equipmentSearch.trim());
                    }
                  }}
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-margin-mobile text-body-sm"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  search
                </span>
              </div>
              {availableSuggestions.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {availableSuggestions.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => addEquipment(item)}
                      className="flex items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-surface-container-highest"
                    >
                      <span className="text-body-sm">{item}</span>
                      <span className="material-symbols-outlined text-primary">
                        add_circle
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 rounded-lg border-l-4 border-primary bg-primary-container/10 p-stack-md">
            <span className="material-symbols-outlined text-primary">
              info
            </span>
            <p className="text-body-sm text-on-surface-variant">
              Ensure the end date does not exceed the maximum allowed
              duration (12 hours) for this permit type.
            </p>
          </div>
        </div>
      </main>

      <WizardBottomBar>
        <button
          type="button"
          onClick={prevStep}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary text-label-lg text-primary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-label-lg text-on-primary shadow-md transition-all active:scale-95"
        >
          Next Step
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </WizardBottomBar>
    </>
  );
}
