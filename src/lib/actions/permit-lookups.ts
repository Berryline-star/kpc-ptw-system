"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSupervisorOptions() {
  // Deliberately NOT using requireUser() here: that throws a redirect,
  // which is correct for page loads but wrong for a background lookup
  // fired from useEffect mid-wizard — a session expiring while someone
  // is mid-form shouldn't yank them to /login out of nowhere. The wizard
  // page itself already calls requireUser() on load, so by the time this
  // runs the user was authenticated; if the session has since expired,
  // returning an empty list lets the dropdown fail safely instead.
  const session = await auth();
  if (!session?.user) return [];

  const supervisors = await prisma.user.findMany({
    where: {
      role: { in: ["SUPERVISOR", "DEPOT_MANAGER"] },
      isActive: true,
    },
    select: { id: true, name: true, department: true },
    orderBy: { name: "asc" },
  });
  return supervisors;
}
