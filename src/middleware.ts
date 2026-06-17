import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-runtime-only auth check (uses the edge-safe config — no bcrypt/
// Prisma here). Real session validation for data access still happens
// server-side in each protected page/layout (see src/lib/session.ts) —
// middleware alone is a UX redirect, not the security boundary.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
