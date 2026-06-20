"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Type" },
  { number: 2, label: "Details" },
  { number: 3, label: "Hazards" },
  { number: 4, label: "Review" },
];

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav className="mb-stack-lg" aria-label="Permit creation progress">
      <div className="relative flex items-center justify-between px-2">
        <div className="absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-surface-container-highest" />
        <div
          className="absolute left-0 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-secondary-container transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />
        {STEPS.map((step) => {
          const isComplete = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-label-md font-bold transition-colors",
                  isComplete && "bg-primary text-on-primary",
                  isActive &&
                    "bg-secondary-container text-on-secondary-container shadow-sm",
                  !isComplete &&
                    !isActive &&
                    "bg-surface-container-high text-on-surface-variant",
                )}
              >
                {isComplete ? (
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-label-sm",
                  isActive
                    ? "font-bold text-on-surface"
                    : "text-on-surface-variant",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
