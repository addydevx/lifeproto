import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(n: number): string {
  return n.toLocaleString("en-US");
}

export function calculateLevel(totalXp: number): { level: number; current: number; required: number; progress: number } {
  // Each level requires level * 500 XP cumulatively-ish (exponential curve)
  let level = 1;
  let consumed = 0;
  let required = 500;

  while (consumed + required <= totalXp) {
    consumed += required;
    level += 1;
    required = Math.floor(500 * Math.pow(1.15, level - 1));
  }

  const current = totalXp - consumed;
  const progress = current / required;

  return { level, current, required, progress };
}
