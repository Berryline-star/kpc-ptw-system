import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Best-effort client IP for rate-limiting anonymous endpoints (like
 * /register, where there's no logged-in user id to key on yet).
 * x-forwarded-for is set by Vercel's edge network; not present/trustworthy
 * if this app is ever run behind a different proxy setup without
 * verifying that proxy sets it. Falls back to a shared bucket if
 * missing, which under-protects rather than throwing — a missing IP
 * shouldn't take the whole registration flow down.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limiter backed by RateLimitEntry (see schema.prisma
 * for why this is a DB table rather than an in-memory Map).
 *
 * Two known imprecisions, both acceptable for abuse-prevention on an
 * internal tool but worth knowing if this is ever load-bearing against
 * adversarial traffic:
 *
 * 1. Fixed-window (not sliding-window/token-bucket): a caller could
 *    burst up to `max` requests right at the end of one window and
 *    another `max` right at the start of the next.
 * 2. This does a read (upsert-as-get-or-create) then a separate update,
 *    not one atomic operation — two truly concurrent requests for the
 *    same key can both read count=max-1 and both get `allowed: true`,
 *    letting the limit be exceeded by a small margin under real
 *    concurrency. A `SELECT ... FOR UPDATE` inside an explicit
 *    transaction would close this, at the cost of holding a row lock
 *    per request — not worth it for what this is protecting today.
 */
export async function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = new Date();

  const entry = await prisma.rateLimitEntry.upsert({
    where: { key },
    create: { key, count: 1, windowStart: now },
    update: {}, // no-op: this call is just get-or-create, see below
  });

  const windowExpired = now.getTime() - entry.windowStart.getTime() > windowMs;

  if (windowExpired) {
    await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: 1, windowStart: now },
    });
    return { allowed: true };
  }

  if (entry.count >= max) {
    const retryAfterMs = windowMs - (now.getTime() - entry.windowStart.getTime());
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  await prisma.rateLimitEntry.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}
