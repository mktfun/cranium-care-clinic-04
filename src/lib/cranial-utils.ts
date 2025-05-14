import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Export SeverityLevel to be used by other files
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
