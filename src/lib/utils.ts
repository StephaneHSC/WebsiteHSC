import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind utility classes safely — later classes override earlier ones,
 * conflicting utilities are deduped (e.g. `p-4 p-2` → `p-2`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
