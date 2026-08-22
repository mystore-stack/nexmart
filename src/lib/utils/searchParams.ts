/**
 * Clean searchParams to remove symbol properties before passing to Client Components
 * Next.js searchParams can contain symbol properties that cannot be serialized to Client Components
 */
export function cleanSearchParams(searchParams: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> {
  const cleaned: Record<string, string | string[] | undefined> = {};
  
  for (const [key, value] of Object.entries(searchParams)) {
    // Only copy string/string[] values, skip symbol properties and other non-serializable values
    if (typeof key === 'string' && (typeof value === 'string' || Array.isArray(value))) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}