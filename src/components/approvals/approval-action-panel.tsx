"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "./signature-pad";
import { approvePermitStep, rejectPermitStep } from "@/lib/actions/approvals";

export function ApprovalActionPanel({
  stepId,
  signerName,
}: {
  stepId: string;
  signerName: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState("");
  const [signed, setSigned] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!signed) {
      setError("Sign in the authorization area before approving.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await approvePermitStep(stepId, comments || undefined);
    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
      return;
    }
    router.push("/approvals");
    router.refresh();
  }

  async function handleReject() {
    if (comments.trim().length < 5) {
      setError(
        "Explain why you're rejecting this permit (min. 5 characters).",
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await rejectPermitStep(stepId, comments);
    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
      return;
    }
    router.push("/approvals");
    router.refresh();
  }

  return (
    <>
      <section className="flex flex-col gap-stack-sm">
        <label
          htmlFor="comments"
          className="px-1 text-label-lg uppercase tracking-wider text-on-surface-variant"
        >
          Review Notes
          {showRejectForm && <span className="text-error"> *</span>}
        </label>
        <textarea
          id="comments"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={
            showRejectForm
              ? "Explain why this permit is being rejected..."
              : "Add observations or specific instructions for the field team..."
          }
          className="w-full rounded-sm border border-outline bg-surface-container-lowest p-stack-md text-body-md placeholder:text-outline/50 focus:border-primary focus:outline-none focus:ring-0"
        />
      </section>

      {!showRejectForm && (
        <SignaturePad
          signerName={signerName}
          signed={signed}
          onSignedChange={setSigned}
        />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <footer className="fixed bottom-0 left-0 z-50 flex w-full gap-gutter border-t border-outline-variant bg-surface-container-lowest p-margin-mobile shadow-lg">
        {showRejectForm ? (
          <>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setError(null);
              }}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-stack-sm border border-outline py-4 text-label-lg text-on-surface-variant transition-transform active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-stack-sm bg-error py-4 text-label-lg font-bold text-on-error transition-transform active:scale-95 disabled:opacity-70"
            >
              <span className="material-symbols-outlined">cancel</span>
              Confirm Rejection
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-stack-sm border border-secondary py-4 text-label-lg text-secondary transition-transform duration-150 hover:brightness-95 active:scale-95"
            >
              <span className="material-symbols-outlined">cancel</span>
              Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-stack-sm bg-primary py-4 text-label-lg font-bold text-on-primary transition-transform duration-150 hover:brightness-95 active:scale-95 disabled:opacity-70"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              {submitting ? "Submitting..." : "Approve"}
            </button>
          </>
        )}
      </footer>
    </>
  );
}
