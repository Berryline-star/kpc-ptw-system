import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, with Tailwind-aware conflict resolution
 * (e.g. cn("p-2", isLarge && "p-4") correctly resolves to just "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
