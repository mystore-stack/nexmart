import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { headers } from "next/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get client IP address from request headers
 * @returns Client IP address or fallback to unknown
 */
export function getClientIp(): string {
  const headersList = headers()
  
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const cfConnectingIp = headersList.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  return 'unknown'
}
