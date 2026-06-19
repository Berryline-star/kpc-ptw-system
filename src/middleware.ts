import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-runtime-only auth check (uses the edge-safe config — no bcrypt/
// Prisma here). Real session validation for data access still happens
// server-side in each protected page/layout (see src/lib/session.ts) —
// middleware alone is a UX redirect, not the security boundary.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on every route except API routes, Next internals, and static
  // files. The authConfig.callbacks.authorized() logic above decides
  // public vs protected per-path, so this matcher doesn't need updating
  // every time a new protected page is added.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
