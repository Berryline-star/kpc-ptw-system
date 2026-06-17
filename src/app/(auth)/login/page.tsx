"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/lib/actions/auth";
import { IconTextField } from "@/components/ui/icon-text-field";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);

  return (
    <div className="glass-panel w-full max-w-[480px] rounded-xl p-stack-lg shadow-2xl md:p-12">
      {/* Brand identity */}
      <div className="mb-stack-lg flex flex-col items-center">
        <div className="mb-stack-md rounded-lg border border-outline-variant/30 bg-white p-4 shadow-sm">
          <span
            className="material-symbols-outlined text-[48px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            factory
          </span>
        </div>
        <h1 className="mb-1 text-headline-sm font-bold tracking-tight text-primary">
          KPC PTW PORTAL
        </h1>
        <p className="text-label-md uppercase tracking-widest text-on-surface-variant opacity-70">
          Kenya Pipeline Company
        </p>
      </div>

      {/* Welcome message */}
      <div className="mb-stack-lg text-center">
        <h2 className="mb-2 text-headline-md text-on-surface">
          Welcome Back
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Access the Digital Permit-to-Work operational safety system.
        </p>
      </div>

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
        <IconTextField
          id="password"
          name="password"
          type="password"
          icon="lock"
          label="Password"
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between py-2">
          <label className="group flex cursor-pointer items-center space-x-2">
            <input
              type="checkbox"
              name="remember"
              className="peer hidden"
            />
            <div className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-outline-variant transition-all peer-checked:border-primary peer-checked:bg-primary">
              <span className="material-symbols-outlined hidden text-[16px] text-white peer-checked:block">
                check
              </span>
            </div>
            <span className="text-label-lg text-on-surface-variant transition-colors group-hover:text-on-surface">
              Remember Me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-label-lg text-primary transition-all hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-md bg-error-container px-stack-md py-2 text-body-sm text-on-error-container"
          >
            {errorMessage}
          </p>
        )}

        <SubmitButton>Sign Into Portal</SubmitButton>
      </form>

      <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-md text-center">
        <p className="text-label-md text-on-surface-variant">
          Authorized Personnel Only.{" "}
          <a href="#" className="font-bold text-secondary hover:underline">
            Request Access
          </a>
        </p>
      </div>
    </div>
  );
}
