export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * The initial scope checks only that the input contains exactly 14 digits.
 * It does not validate check digits or query any official/external source.
 */
export function isValidCnpj(value: string): boolean {
  return /^[\d./\-\s]+$/.test(value) && normalizeCnpj(value).length === 14;
}
