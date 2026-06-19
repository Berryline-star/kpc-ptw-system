import { requireUser } from "@/lib/session";

/**
 * Temporary placeholder — gets replaced by the real Operations Dashboard
 * (stat cards, trend chart, risk donut, activity feed) in the next phase.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col items-center justify-center gap-stack-sm p-margin-mobile py-stack-lg text-center md:p-margin-desktop">
      <p className="text-label-md uppercase text-on-surface-variant">
        Phase 3 checkpoint
      </p>
      <h1 className="text-headline-lg text-primary">
        Welcome, {user.name}
      </h1>
      <p className="text-body-md text-on-surface-variant">
        The app shell is live — try the sidebar/bottom nav links.
      </p>
    </div>
  );
}
