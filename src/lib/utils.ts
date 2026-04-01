import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging Tailwind CSS classes safely
 * handle conflict resolution between base styles and overrides
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into a user-friendly local format
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Utility for generating currency strings (TRY)
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}

/**
 * Deep clone utility for complex objects
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Shorthand for conditional rendering
 */
export function isDefined<T>(val: T | undefined | null): val is T {
    return val !== undefined && val !== null
}

/**
 * Enterprise Grade Logging Utility
 * Includes levels: INFO, WARN, ERROR, DEBUG
 */
export const logger = {
    info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

/**
 * Validation utility for common ServisNode patterns
 */
export const validators = {
    isEmail: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    isStrongPassword: (val: string) => val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val),
}
