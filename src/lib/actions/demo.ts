"use server";

import { signIn, AuthError } from "@/auth";

// Demo visitors are signed into a real seeded account rather than a
// fake read-only view, so they see genuinely live data end-to-end. This
// is a dedicated "Demo Account" persona (see prisma/seed.ts) — not the
// real Contractor persona (John Njenga) — specifically so it's obvious
// in the UI that you're in a shared demo, and so demo activity is easy
// to identify and clean out separately from real seeded data.
//
// Known tradeoff, worth fixing before a real public launch: every demo
// visitor still shares this *same* underlying account, so they can see
// each other's demo activity. Fine for showing the product internally;
// before opening this up publicly, swap this for a fresh throwaway
// account provisioned per visitor, or make the account read-only.
const DEMO_EMAIL = "demo@kpc.co.ke";
const DEMO_PASSWORD = "Password123!";

export async function startDemoSession(): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "The demo account is temporarily unavailable — please try again shortly.";
    }
    throw error;
  }
}
