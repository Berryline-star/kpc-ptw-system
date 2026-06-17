import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

/**
 * Defense-in-depth: middleware redirects unauthenticated users for UX,
 * but every protected Server Component / Server Action should also call
 * this directly rather than trusting middleware ran. (Next.js middleware
 * has had real bypass vulnerabilities in the past — CVE-2025-29927 — so
 * it's treated as a UX layer, not the security boundary.)
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireRole(...allowed: Role[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}
