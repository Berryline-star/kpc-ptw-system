import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. Middleware runs on the Edge runtime, which
 * can't use bcrypt or the Prisma Node client — so the Credentials
 * provider's `authorize` logic lives in `auth.ts` instead, and only gets
 * pulled in for the Node-runtime route handlers / server actions /
 * server components. This file holds everything middleware needs:
 * which routes require a session, and what goes into the JWT/session.
 */
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

      const isProtectedRoute = pathname.startsWith("/dashboard");
      const isLoginPage = pathname === "/login";

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
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
