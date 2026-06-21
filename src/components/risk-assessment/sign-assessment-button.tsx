"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signRiskAssessment } from "@/lib/actions/risk-assessment";

export function SignAssessmentButton({
  riskAssessmentId,
  alreadySigned,
}: {
  riskAssessmentId: string;
  alreadySigned: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    setSubmitting(true);
    setError(null);
    const result = await signRiskAssessment(riskAssessmentId);
    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
      return;
    }
    router.refresh();
    setSubmitting(false);
  }

  if (alreadySigned) {
    return (
      <div className="flex h-14 w-full items-center justify-center gap-2 bg-green-50 text-label-lg uppercase tracking-widest text-green-700">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified
        </span>
        Assessment Verified
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-stack-lg">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleSign}
        disabled={submitting}
        className="flex h-14 w-full items-center justify-center gap-2 bg-primary text-label-lg uppercase tracking-widest text-on-primary transition-transform active:scale-95 disabled:opacity-70"
      >
        <span className="material-symbols-outlined">draw</span>
        {submitting ? "Signing..." : "Sign & Submit Assessment"}
      </button>
    </div>
  );
}
