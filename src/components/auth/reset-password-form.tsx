"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/password-reset";
import { IconTextField } from "@/components/ui/icon-text-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, undefined);

  if (state?.success) {
    return (
      <div className="space-y-stack-md text-center">
        <p className="rounded-md bg-surface-container px-stack-md py-3 text-body-sm text-on-surface">
          {state.message}
        </p>
        <Link
          href="/login"
          className="inline-block text-label-lg text-primary hover:underline"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-stack-md">
      <input type="hidden" name="token" value={token} />
      <IconTextField
        id="password"
        name="password"
        type="password"
        icon="lock"
        label="New Password"
        placeholder="At least 8 characters"
        required
      />
      <IconTextField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        icon="lock"
        label="Confirm New Password"
        placeholder="Re-enter your new password"
        required
      />
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
        >
          {state.message}
        </p>
      )}
      <SubmitButton icon="check">Update Password</SubmitButton>
    </form>
  );
}
