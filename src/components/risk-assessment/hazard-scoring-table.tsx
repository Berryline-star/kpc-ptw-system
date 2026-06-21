"use client";

import { useState, useTransition } from "react";
import { LIKELIHOOD_SCALE, SEVERITY_SCALE } from "@/lib/config/risk-matrix";
import { updateHazardScore } from "@/lib/actions/risk-assessment";
import { cn } from "@/lib/utils";

interface HazardForScoring {
  id: string;
  description: string;
  category: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

const RISK_BADGE_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-secondary-fixed text-on-secondary-fixed",
  HIGH: "bg-error-container text-on-error-container",
};

const RISK_BADGE_SUFFIX: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Med",
  HIGH: "High",
};

export function HazardScoringTable({
  hazards,
  readOnly,
}: {
  hazards: HazardForScoring[];
  readOnly: boolean;
}) {
  const [items, setItems] = useState(hazards);
  const [selectedId, setSelectedId] = useState<string | null>(
    hazards[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<"likelihood" | "severity">(
    "likelihood",
  );
  const [isPending, startTransition] = useTransition();

  const selected = items.find((h) => h.id === selectedId);
  const scale =
    activeTab === "likelihood" ? LIKELIHOOD_SCALE : SEVERITY_SCALE;

  function applyScore(value: number) {
    if (!selected || readOnly) return;
    const likelihood =
      activeTab === "likelihood" ? value : selected.likelihood;
    const severity = activeTab === "severity" ? value : selected.severity;

    setItems((prev) =>
      prev.map((h) =>
        h.id === selected.id
          ? { ...h, likelihood, severity, riskScore: likelihood * severity }
          : h,
      ),
    );

    startTransition(async () => {
      await updateHazardScore(selected.id, likelihood, severity);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
      <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest md:col-span-2">
        <div className="flex items-center justify-between bg-surface-container p-4">
          <h3 className="text-label-lg text-on-surface">
            Hazard Identification
          </h3>
          <span className="rounded bg-primary-container px-2 py-0.5 text-label-sm text-on-primary-container">
            {items.length} Identified
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-variant/30">
                <th className="p-4 text-label-md uppercase text-on-surface-variant">
                  Hazard Description
                </th>
                <th className="p-4 text-label-md uppercase text-on-surface-variant">
                  L
                </th>
                <th className="p-4 text-label-md uppercase text-on-surface-variant">
                  S
                </th>
                <th className="p-4 text-right text-label-md uppercase text-on-surface-variant">
                  Risk Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map((hazard) => (
                <tr
                  key={hazard.id}
                  onClick={() => !readOnly && setSelectedId(hazard.id)}
                  className={cn(
                    "transition-colors",
                    !readOnly &&
                      "cursor-pointer hover:bg-surface-container-low",
                    selectedId === hazard.id &&
                      !readOnly &&
                      "bg-primary-fixed/20",
                  )}
                >
                  <td className="p-4">
                    <p className="text-body-md font-bold">
                      {hazard.category}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {hazard.description}
                    </p>
                  </td>
                  <td className="p-4 text-body-md">{hazard.likelihood}</td>
                  <td className="p-4 text-body-md">{hazard.severity}</td>
                  <td className="p-4 text-right">
                    <span
                      className={cn(
                        "rounded px-3 py-1 font-bold",
                        RISK_BADGE_STYLES[hazard.riskLevel],
                      )}
                    >
                      {hazard.riskScore} ({RISK_BADGE_SUFFIX[hazard.riskLevel]}
                      )
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!readOnly && selected && (
        <div className="flex flex-col border border-outline-variant bg-surface-container-lowest md:col-span-2">
          <div className="flex border-b border-outline-variant">
            <button
              type="button"
              onClick={() => setActiveTab("likelihood")}
              className={cn(
                "flex-1 p-4 text-label-md transition-colors",
                activeTab === "likelihood"
                  ? "border-b-2 border-primary bg-primary-fixed/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              Likelihood
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("severity")}
              className={cn(
                "flex-1 p-4 text-label-md transition-colors",
                activeTab === "severity"
                  ? "border-b-2 border-primary bg-primary-fixed/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              Severity
            </button>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-label-sm text-on-surface-variant">
              Scoring:{" "}
              <span className="font-bold text-on-surface">
                {selected.category}
              </span>
              {isPending && " · saving…"}
            </p>
            {scale.map((option) => {
              const currentValue =
                activeTab === "likelihood"
                  ? selected.likelihood
                  : selected.severity;
              const isActive = currentValue === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => applyScore(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between border p-2 text-left transition-colors",
                    isActive
                      ? "border-primary text-primary ring-1 ring-primary"
                      : "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container",
                  )}
                >
                  <span className="font-bold">{option.label}</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {option.description}
                  </span>
                </button>
              );
            })}
            <p className="mt-2 text-body-sm italic text-on-surface-variant">
              *Definitions based on KPC Safety Manual Rev 4.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
