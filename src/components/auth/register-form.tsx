"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/actions/register";
import { IconTextField } from "@/components/ui/icon-text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const SELF_SERVE_ROLE_OPTIONS = [
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

export function RegisterForm() {
  const [state, formAction] = useActionState(registerUser, undefined);

  if (state?.success) {
    return (
      <div className="glass-panel w-full max-w-[480px] rounded-xl p-stack-lg text-center shadow-2xl md:p-12">
        <div className="mx-auto mb-stack-md flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[28px]">
            mark_email_read
          </span>
        </div>
        <h2 className="mb-2 text-headline-md text-on-surface">
          Account created
        </h2>
        <p className="mb-stack-lg text-body-sm text-on-surface-variant">
          A safety administrator needs to approve your account before you
          can sign in. You&rsquo;ll be able to log in as soon as that
          happens — no further action needed from you right now.
        </p>
        <Link
          href="/login"
          className="text-label-lg text-primary hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full max-w-[480px] rounded-xl p-stack-lg shadow-2xl md:p-12">
      <div className="mb-stack-lg text-center">
        <h1 className="mb-1 text-headline-sm font-bold tracking-tight text-primary">
          CREATE ACCOUNT
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          For contractors and site supervisors working with KPC.
        </p>
      </div>

      <form action={formAction} className="space-y-stack-md">
        <IconTextField
          id="name"
          name="name"
          type="text"
          icon="person"
          label="Full Name"
          placeholder="Jane Wanjiru"
          required
        />
        <IconTextField
          id="email"
          name="email"
          type="email"
          icon="mail"
          label="Email Address"
          placeholder="you@company.com"
          required
        />
        <IconTextField
          id="department"
          name="department"
          type="text"
          icon="apartment"
          label="Company / Department (optional)"
          placeholder="e.g. Mwangi Engineering Ltd"
        />

        <div className="space-y-unit">
          <label
            htmlFor="role"
            className="ml-1 block text-label-lg text-on-surface-variant"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue=""
            className="w-full rounded-lg border border-outline-variant bg-white/50 px-4 py-3 text-body-md text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" disabled>
              Select your role
            </option>
            {SELF_SERVE_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="ml-1 text-label-sm text-on-surface-variant opacity-70">
            KPC staff roles (Safety Officer, Depot Manager, Admin) are
            assigned internally — contact the Safety Desk for those.
          </p>
        </div>

        <IconTextField
          id="password"
          name="password"
          type="password"
          icon="lock"
          label="Password"
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
        <IconTextField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          icon="lock"
          label="Confirm Password"
          placeholder="••••••••"
          required
        />

        {state?.error && (
          <p
            role="alert"
            className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
          >
            {state.error}
          </p>
        )}

        <SubmitButton>Create Account</SubmitButton>
      </form>

      <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-md text-center">
        <p className="text-label-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-secondary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
