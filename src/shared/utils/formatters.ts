// Shared utilities - Formatting functions
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date);
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

export function formatCasNumber(cas: string): string {
  // Format CAS number as XXX-XX-X
  return cas.replace(/(\d+)-(\d+)-(\d+)/, '$1-$2-$3');
}
