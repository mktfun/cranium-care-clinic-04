
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Json } from "@/integrations/supabase/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts a potential array, object, or JSON value to an array
 * @param value - The value to ensure is an array
 * @param defaultValue - Optional default value if the input is empty
 * @returns An array containing the input value(s)
 */
export function ensureArray<T>(value: T | T[] | null | undefined | Json, defaultValue?: T[]): T[] {
  if (!value) {
    return defaultValue || [];
  }
  
  if (Array.isArray(value)) {
    return value as T[];
  }
  
  return [value as T];
}
