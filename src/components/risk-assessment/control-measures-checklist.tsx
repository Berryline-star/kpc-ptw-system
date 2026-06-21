"use client";

import { useState, useTransition } from "react";
import { toggleControlMeasure } from "@/lib/actions/risk-assessment";
import { cn } from "@/lib/utils";

interface ControlMeasureItem {
  id: string;
  description: string;
  status: "IMPLEMENTED" | "PENDING_DEPLOYMENT";
}

export function ControlMeasuresChecklist({
  measures,
  readOnly,
}: {
  measures: ControlMeasureItem[];
  readOnly: boolean;
}) {
  const [items, setItems] = useState(measures);
  const [, startTransition] = useTransition();

  function handleToggle(id: string) {
    if (readOnly) return;
    setItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status:
                m.status === "IMPLEMENTED"
                  ? "PENDING_DEPLOYMENT"
                  : "IMPLEMENTED",
            }
          : m,
      ),
    );
    startTransition(async () => {
      await toggleControlMeasure(id);
    });
  }

  return (
    <div className="flex flex-col border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center gap-2 border-b border-outline-variant p-4">
        <span className="material-symbols-outlined text-primary">
          task_alt
        </span>
        <h3 className="text-label-lg text-on-surface">Control Measures</h3>
      </div>
      <div className="space-y-4 p-4">
        {items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            No control measures recorded yet.
          </p>
        ) : (
          items.map((measure) => {
            const isImplemented = measure.status === "IMPLEMENTED";
            return (
              <button
                type="button"
                key={measure.id}
                onClick={() => handleToggle(measure.id)}
                disabled={readOnly}
                className={cn(
                  "group flex w-full items-start gap-4 text-left",
                  !readOnly && "cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "mt-1 flex h-6 w-6 shrink-0 items-center justify-center border-2",
                    isImplemented
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline bg-transparent",
                  )}
                >
                  {isImplemented && (
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
                      check
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-body-md font-bold text-on-surface">
                    {measure.description}
                  </p>
                  <p
                    className={cn(
                      "text-label-sm font-bold uppercase",
                      isImplemented ? "text-green-600" : "text-secondary",
                    )}
                  >
                    {isImplemented ? "Implemented" : "Pending Deployment"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
