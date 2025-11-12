// Shared utilities - Validation functions
export function isValidCasNumber(cas: string): boolean {
  const casPattern = /^\d{2,7}-\d{2}-\d$/;
  return casPattern.test(cas);
}

export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}
