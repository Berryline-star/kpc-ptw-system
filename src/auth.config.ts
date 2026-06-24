import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. Middleware runs on the Edge runtime, which
 * can't use bcrypt or the Prisma Node client — so the Credentials
 * provider's `authorize` logic lives in `auth.ts` instead, and only gets
 * pulled in for the Node-runtime route handlers / server actions /
 * server components. This file holds everything middleware needs:
 * which routes require a session, and what goes into the JWT/session.
 */
const PUBLIC_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTE_PREFIXES = ["/verify/"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublicRoute =
        PUBLIC_ROUTES.includes(pathname) ||
        PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (isPublicRoute) {
        return true;
      }

      // Everything not explicitly public requires a session. This means
      // every new page added under (app) in later phases is automatically
      // protected — no middleware edits needed per route.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Credentials provider is added in auth.ts (Node-only)
} satisfies NextAuthConfig;
