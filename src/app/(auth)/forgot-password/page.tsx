"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { IconTextField } from "@/components/ui/icon-text-field";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="glass-panel w-full max-w-[480px] rounded-xl p-stack-lg shadow-2xl md:p-12">
      <div className="mb-stack-lg text-center">
        <h2 className="mb-2 text-headline-md text-on-surface">
          Reset Your Password
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Enter the email associated with your KPC account and we&apos;ll
          send you a link to reset your password.
        </p>
      </div>

      {state?.message ? (
        <p className="rounded-md bg-surface-container px-stack-md py-3 text-center text-body-sm text-on-surface">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="space-y-stack-md">
          <IconTextField
            id="email"
            name="email"
            type="email"
            icon="mail"
            label="Email Address"
            placeholder="officer.name@kpc.co.ke"
            required
          />
          <SubmitButton icon="send">Send Reset Link</SubmitButton>
        </form>
      )}

      <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-md text-center">
        <Link
          href="/login"
          className="text-label-lg text-primary hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
