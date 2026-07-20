import type { DefaultSession, DefaultUser } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

// IMPORTANT: this augments "@auth/core/jwt", not "next-auth/jwt".
// "next-auth/jwt" is just `export * from "@auth/core/jwt"` (a
// re-export) — TypeScript's declaration merging doesn't follow through
// re-exports, so augmenting "next-auth/jwt" creates an augmentation
// that's invisible to any code using the *original* module. Since
// @auth/core's own NextAuthConfig callback types (used by
// `authConfig` in auth.config.ts) import JWT from "./jwt.js" (i.e.
// @auth/core/jwt) directly, augmenting only "next-auth/jwt" meant
// `token.role` in the session callback silently fell back to JWT's
// base `Record<string, unknown>` index signature — typed as
// `unknown`, not `Role`. This produced a real (not stale-client)
// TypeScript build failure that went unnoticed locally because it got
// lumped in with other, genuinely-stale-client errors during
// development.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// Kept too, in case any other code in this app imports the JWT type
// via "next-auth/jwt" specifically — costs nothing, and closes off
// this exact class of bug from recurring via that path too.
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
