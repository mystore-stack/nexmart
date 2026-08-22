// src/lib/validate-enum.ts
// Type-safe enum validation helper for Prisma queries

/**
 * Validates that a value is a valid member of an enum array.
 * Returns the value if valid, undefined otherwise.
 * 
 * @param value - The value to validate
 * @param allowedValues - Array of allowed enum values
 * @returns The validated value or undefined if invalid
 */
export function validateEnum<T extends string>(value: any, allowedValues: readonly T[]): T | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string') return undefined;
  return allowedValues.includes(value as T) ? (value as T) : undefined;
}

/**
 * Validates an array of values against an enum array.
 * Returns only the valid values.
 * 
 * @param values - Array of values to validate
 * @param allowedValues - Array of allowed enum values
 * @returns Array of valid values
 */
export function validateEnumArray<T extends string>(values: any[], allowedValues: readonly T[]): T[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is T => 
    typeof value === 'string' && allowedValues.includes(value as T)
  );
}
