// Matches the account created in prisma/seed.ts and signed into by
// startDemoSession() in src/lib/actions/demo.ts. Kept as a single
// source of truth here (rather than duplicated across files, or living
// inside a UI component) since both UI code (banner, FAB) and business
// logic (createPermit's server-side guard) need to check this.
const DEMO_EMAIL = "demo@kpc.co.ke";

export function isDemoAccount(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}
