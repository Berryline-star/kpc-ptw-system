import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validation/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Per-account lockout (below) doesn't stop one IP trying many
        // *different* accounts — a credential-stuffing attempt spread
        // across a leaked email list wouldn't trip any single account's
        // 5-attempt threshold. This is a separate, per-IP ceiling on
        // top of it. Deliberately looser than the account lockout
        // (20/15min vs 5/15min) since one IP can legitimately represent
        // a shared office network with several real people logging in.
        const ip = await getClientIp();
        const ipRateLimit = await checkRateLimit(`login-ip:${ip}`, {
          max: 20,
          windowMs: 15 * 60 * 1000,
        });
        if (!ipRateLimit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        // Deliberately returns the same generic failure as a wrong
        // password (rather than a distinct "account locked" message)
        // so a caller can't use the difference to enumerate which
        // emails have real accounts vs which are just locked out.
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          const attempts = user.failedLoginAttempts + 1;
          const lockingOut = attempts >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: lockingOut
              ? {
                  failedLoginAttempts: 0,
                  lockedUntil: new Date(
                    Date.now() + LOCKOUT_MINUTES * 60 * 1000,
                  ),
                }
              : { failedLoginAttempts: attempts },
          });
          return null;
        }

        // Successful login clears any lockout state left over from an
        // earlier failed streak that didn't reach the threshold.
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        // Returned object becomes `user` in the jwt() callback.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

export { AuthError };
