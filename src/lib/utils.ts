import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, with Tailwind-aware conflict resolution
 * (e.g. cn("p-2", isLarge && "p-4") correctly resolves to just "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a user-supplied redirect target (e.g. `?callbackUrl=...`)
 * is a same-origin path before it's ever passed to `redirect()` or
 * `signIn({ redirectTo })`. Without this, an attacker could craft a link
 * like `/login?callbackUrl=https://evil.example` and, after the victim
 * legitimately authenticates, get silently forwarded off-site — a
 * classic open-redirect. Only bare paths starting with a single "/" are
 * accepted; protocol-relative ("//evil.com") and absolute URLs are
 * rejected and the caller falls back to a safe default.
 */
export function getSafeRedirectPath(
  path: string | undefined | null,
  fallback: string,
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

