"use client";

import { useState } from "react";
import { usePermitWizard } from "./permit-wizard-context";
import { WizardStepper } from "./wizard-stepper";
import { WizardBottomBar } from "./wizard-chrome";
import { PERMIT_TYPE_OPTIONS, step1Schema } from "@/lib/validation/permit";

export function Step1TypeLocation() {
  const { data, updateData, nextStep } = usePermitWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);

  function handleAutoFillGPS() {
    setLocating(true);
    if (!("geolocation" in navigator)) {
      setTimeout(() => {
        updateData({ gpsLat: -4.0435, gpsLng: 39.6682 });
        setLocating(false);
      }, 800);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateData({
          gpsLat: pos.coords.latitude,
          gpsLng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        updateData({ gpsLat: -4.0435, gpsLng: 39.6682 });
        setLocating(false);
      },
      { timeout: 8000 },
    );
  }

  function handleNext() {
    const result = step1Schema.safeParse({
      type: data.type,
      facilityName: data.facilityName,
      specificLocation: data.specificLocation,
      gpsLat: data.gpsLat,
      gpsLng: data.gpsLng,
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
      <main className="mx-auto w-full max-w-md flex-grow px-margin-mobile pb-32 pt-14">
        <div className="mb-stack-lg mt-stack-lg">
          <WizardStepper currentStep={1} />
          <div className="text-center">
            <span className="text-label-lg font-bold uppercase tracking-wider text-secondary">
              Step 1 of 4: Type &amp; Location
            </span>
          </div>
        </div>

        <div className="space-y-stack-lg">
          <div className="space-y-stack-sm">
            <label
              htmlFor="permit-type"
              className="flex items-center gap-2 text-label-lg text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                assignment
              </span>
              Permit Type
            </label>
            <div className="relative">
              <select
                id="permit-type"
                value={data.type}
                onChange={(e) => updateData({ type: e.target.value })}
                className="h-14 w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-stack-md pr-12 text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary"
              >
                <option disabled value="">
                  Select permit type...
                </option>
                {PERMIT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
            {errors.type && (
              <p className="px-1 text-label-sm text-error">{errors.type}</p>
            )}
          </div>

          <div className="space-y-stack-sm">
            <label
              htmlFor="facility"
              className="flex items-center gap-2 text-label-lg text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                factory
              </span>
              Facility Name
            </label>
            <input
              id="facility"
              type="text"
              placeholder="e.g. Mombasa Terminal"
              value={data.facilityName}
              onChange={(e) => updateData({ facilityName: e.target.value })}
              className="h-14 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-stack-md text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary"
            />
            {errors.facilityName && (
              <p className="px-1 text-label-sm text-error">
                {errors.facilityName}
              </p>
            )}
          </div>

          <div className="space-y-stack-sm">
            <label
              htmlFor="location"
              className="flex items-center gap-2 text-label-lg text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                near_me
              </span>
              Specific Location / Unit
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Pump House B, Tank 4"
              value={data.specificLocation}
              onChange={(e) =>
                updateData({ specificLocation: e.target.value })
              }
              className="h-14 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-stack-md text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary"
            />
            {errors.specificLocation && (
              <p className="px-1 text-label-sm text-error">
                {errors.specificLocation}
              </p>
            )}
          </div>

          <div className="space-y-stack-sm">
            <div className="flex items-center justify-between">
              <label
                htmlFor="gps"
                className="flex items-center gap-2 text-label-lg text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">
                  location_on
                </span>
                GPS Coordinates
              </label>
              <button
                type="button"
                onClick={handleAutoFillGPS}
                className="flex items-center gap-1 text-label-md text-primary transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  my_location
                </span>
                Auto-fill
              </button>
            </div>
            <div className="relative">
              <input
                id="gps"
                readOnly
                type="text"
                placeholder="-4.0435, 39.6682"
                value={
                  data.gpsLat !== null && data.gpsLng !== null
                    ? `${data.gpsLat.toFixed(6)}, ${data.gpsLng.toFixed(6)}`
                    : ""
                }
                className="h-14 w-full cursor-not-allowed rounded-xl border border-outline-variant bg-surface-container px-stack-md text-body-md text-on-surface-variant/70"
              />
              {locating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
                </div>
              )}
            </div>
            <p className="px-1 text-[11px] text-on-surface-variant opacity-70">
              Ensure location services are enabled for precision auditing.
            </p>
          </div>
        </div>
      </main>

      <WizardBottomBar>
        <button
          type="button"
          className="h-14 flex-1 rounded-xl bg-surface-container-high text-label-lg text-on-surface-variant transition-all active:scale-95"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-lg font-bold text-on-secondary-container shadow-md transition-all active:scale-95"
        >
          Next: Details
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </WizardBottomBar>
    </>
  );
}
