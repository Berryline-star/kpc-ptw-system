import { requireUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";

/**
 * Temporary placeholder — proves the full auth loop (login -> session ->
 * route protection -> role in session -> logout) before the real
 * Operations Dashboard UI lands in Phase 4.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-stack-md bg-background p-margin-mobile text-center">
      <p className="text-label-md uppercase text-on-surface-variant">
        Phase 2 checkpoint
      </p>
      <h1 className="text-headline-lg text-primary">Welcome, {user.name}</h1>
      <p className="text-body-md text-on-surface-variant">
        Signed in as {user.email} &middot; Role: {user.role}
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg bg-primary px-stack-lg py-3 text-label-lg text-on-primary transition-all hover:bg-primary-container"
        >
          Sign Out
        </button>
      </form>
    </main>
  );
}
